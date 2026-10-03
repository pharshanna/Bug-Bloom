// src/components/ai/AISummary.jsx — "Summarize my feedback" button + results. Owned by Person 3.
//
// Usage (on the project page):  <AISummary projectId={id} />
// It loads the project's feedback from Firebase, sends it to /api/summarize (Azure OpenAI),
// and shows top problems, strengths and a to-do list.
import { useState } from 'react'
import { getProject, getTests } from '../../firebase/api'
import './ai.css'

export default function AISummary({ projectId }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSummarize() {
    setLoading(true)
    setError('')
    try {
      const [project, tests] = await Promise.all([getProject(projectId), getTests(projectId)])
      if (tests.length === 0) {
        throw new Error('There’s no feedback to summarize yet. Ask someone to test this project first! 🌱')
      }
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            title: project.title,
            description: project.description,
            testRequest: project.testRequest,
          },
          tests: tests.map(({ liked, confused, suggestion, rating }) => ({ liked, confused, suggestion, rating })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'The Grove Spirit is resting. Please try again in a moment.')
      setSummary(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-summary">
      {!summary && !loading && (
        <div className="ai-summary__intro">
          <p className="ai-summary__lead">
            Let the <strong>Grove Spirit</strong> read every piece of feedback and turn it into a clear to-do list.
          </p>
          <button className="grove-button" onClick={handleSummarize}>✨ Summarize feedback</button>
        </div>
      )}

      {loading && (
        <div className="ai-summary__loading" role="status">
          <span className="ai-summary__orb" aria-hidden="true" />
          The Grove Spirit is reading the feedback…
        </div>
      )}

      {error && <p className="grove-error">{error}</p>}

      {summary && !loading && (
        <div className="ai-summary__result">
          {summary.encouragement && <p className="ai-summary__encourage">🌿 {summary.encouragement}</p>}

          <div className="ai-summary__grid">
            <Section title="🐛 Top problems" items={summary.problems} kind="problems" />
            <Section title="🌸 Strengths" items={summary.strengths} kind="strengths" />
          </div>

          {summary.todo?.length > 0 && (
            <div className="ai-summary__todo">
              <h3>✅ Your to-do list</h3>
              <ol>
                {summary.todo.map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            </div>
          )}

          <div className="ai-summary__footer">
            <span className="grove-muted">
              Based on {summary.testCount} {summary.testCount === 1 ? 'test' : 'tests'} · powered by {summary.provider}
            </span>
            <button className="grove-button secondary" onClick={handleSummarize}>↻ Refresh</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, items = [], kind }) {
  if (!items.length) return null
  return (
    <div className={`ai-summary__section ai-summary__section--${kind}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}
