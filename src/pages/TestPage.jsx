// src/pages/TestPage.jsx — the feedback form. Submitting earns 1 Seed. Owned by Person 1.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProject, submitTest } from '../firebase/api'
import { useUser } from './UserContext'

const MIN = 30

export default function TestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshUser } = useUser()
  const [project, setProject] = useState(null)
  const [liked, setLiked] = useState('')
  const [confused, setConfused] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getProject(id).then(setProject).catch((err) => setError(err.message))
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (liked.trim().length < MIN || confused.trim().length < MIN) {
      setError(`Please write at least ${MIN} characters for each answer.`)
      return
    }
    if (!rating) {
      setError('Please choose a rating.')
      return
    }
    setBusy(true)
    try {
      await submitTest(id, { liked, confused, suggestion, rating })
      await refreshUser()
      setDone(true)
      setTimeout(() => navigate(`/project/${id}`), 1800)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!project && !error) return <p className="page-status">Loading…</p>

  if (done) {
    return (
      <div className="grove-card celebrate">
        <div className="celebrate__emoji">🌱</div>
        <h1 className="grove-heading">+1 Seed!</h1>
        <p className="grove-muted">Thanks for helping {project.ownerName}'s project grow.</p>
      </div>
    )
  }

  return (
    <div className="narrow">
      <Link to={`/project/${id}`} className="back-link">← Back to project</Link>
      <form className="grove-card form" onSubmit={handleSubmit}>
        <h1 className="grove-heading">Test “{project?.title}”</h1>
        {project && (
          <>
            <a href={project.link} target="_blank" rel="noreferrer" className="grove-button secondary">
              1. Open the project ↗
            </a>
            {project.testRequest && (
              <div className="test-request">
                <strong>🔍 The owner wants you to test:</strong>
                <p>{project.testRequest}</p>
              </div>
            )}
          </>
        )}

        <p className="grove-muted">2. Try it out, then tell them what you thought. Honest + specific feedback is the most helpful!</p>

        <Field label="What did you like?" value={liked} onChange={setLiked} min={MIN} />
        <Field label="What confused you or didn’t work?" value={confused} onChange={setConfused} min={MIN} />
        <Field label="One suggestion (optional)" value={suggestion} onChange={setSuggestion} />

        <div className="field">
          <span className="grove-label">Overall rating</span>
          <div className="rating" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                className={`rating__star ${n <= rating ? 'is-on' : ''}`}
                onClick={() => setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {error && <p className="grove-error">{error}</p>}

        <button className="grove-button" type="submit" disabled={busy}>
          {busy ? 'Planting…' : 'Submit feedback (+1 Seed)'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, min }) {
  const length = value.trim().length
  return (
    <div className="field">
      <label className="grove-label">
        {label}
        <textarea className="grove-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
      {min && (
        <span className={`char-count ${length >= min ? 'is-ok' : ''}`}>
          {length >= min ? '✓ looks good' : `${length}/${min} characters`}
        </span>
      )}
    </div>
  )
}
