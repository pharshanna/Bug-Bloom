// src/pages/ProjectPage.jsx — one project: details, feedback, AI summary, comments. Owned by Person 1.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProject, getTests, addComment, listenToComments } from '../firebase/api'
import { useUser } from './UserContext'
import Sapling from '../components/grove/Sapling'
// When Person 3's component is ready, uncomment this line and the <AISummary> below:
// import AISummary from '../components/ai/AISummary'

export default function ProjectPage() {
  const { id } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tests, setTests] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [error, setError] = useState('')
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    getProject(id).then(setProject).catch((err) => setError(err.message))
    getTests(id).then(setTests).catch(() => {})
    // live comments — the returned function stops listening when we leave the page
    const unsubscribe = listenToComments(id, setComments)
    return unsubscribe
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    setCommentError('')
    try {
      await addComment(id, newComment)
      setNewComment('')
    } catch (err) {
      setCommentError(err.message)
    }
  }

  if (error) return <p className="grove-error">{error}</p>
  if (!project) return <p className="page-status">Loading project…</p>

  const isMine = project.ownerId === user?.id

  return (
    <div className="project-page">
      <Link to="/" className="back-link">← Back to the Grove</Link>

      <section className="grove-card project-hero">
        <div className="project-hero__info">
          <h1 className="grove-heading">{project.title}</h1>
          <p className="grove-muted">by {project.ownerName}{isMine && ' (you)'}</p>
          <p>{project.description}</p>

          {project.testRequest && (
            <div className="test-request">
              <strong>🔍 What I want tested:</strong>
              <p>{project.testRequest}</p>
            </div>
          )}

          <div className="project-hero__actions">
            <a href={project.link} target="_blank" rel="noreferrer" className="grove-button secondary">
              Open project ↗
            </a>
            {!isMine && (
              <>
                <Link to={`/project/${id}/test`} className="grove-button">Test this project (+1 Seed)</Link>
                <button
                  className="grove-button secondary"
                  onClick={() => navigate(`/messages/${project.ownerId}?name=${encodeURIComponent(project.ownerName)}`)}
                >
                  💬 Message owner
                </button>
              </>
            )}
          </div>
        </div>
        <Sapling feedbackCount={project.feedbackCount || 0} size="lg" showCount />
      </section>

      {/* ---- AI summary (Person 3) ---- */}
      <section className="grove-card">
        <h2 className="grove-heading">✨ AI Feedback Summary</h2>
        {/* <AISummary projectId={id} /> */}
        <p className="grove-muted">Coming soon: the Grove Spirit will summarize all feedback into a to-do list.</p>
      </section>

      {/* ---- Feedback ---- */}
      <section className="grove-card">
        <h2 className="grove-heading">🌿 Feedback ({tests.length})</h2>
        {tests.length === 0 && <p className="grove-muted">No feedback yet. Be the first to test it!</p>}
        <div className="feedback-list">
          {tests.map((t) => (
            <div key={t.id} className="feedback">
              <div className="feedback__head">
                <strong>{t.testerName}</strong>
                <span className="grove-pill">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
              </div>
              <p><b>Liked:</b> {t.liked}</p>
              <p><b>Confused by:</b> {t.confused}</p>
              {t.suggestion && <p><b>Suggestion:</b> {t.suggestion}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ---- Comments ---- */}
      <section className="grove-card">
        <h2 className="grove-heading">💬 Comments ({comments.length})</h2>
        <div className="comment-list">
          {comments.length === 0 && <p className="grove-muted">No comments yet. Start the conversation!</p>}
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <strong>{c.authorName}</strong>
              <span className="comment__time">{c.createdAt ? c.createdAt.toLocaleString() : 'just now'}</span>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
        <form className="comment-form" onSubmit={handleComment}>
          <input
            className="grove-input"
            placeholder="Write a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="grove-button" type="submit" disabled={!newComment.trim()}>Post</button>
        </form>
        {commentError && <p className="grove-error">{commentError}</p>}
      </section>
    </div>
  )
}
