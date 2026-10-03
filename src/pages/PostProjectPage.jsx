// src/pages/PostProjectPage.jsx — plant (post) a new project. Costs 1 Seed. Owned by Person 1.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProject } from '../firebase/api'
import { useUser } from './UserContext'
import SeedBadge from '../components/grove/SeedBadge'

export default function PostProjectPage() {
  const { user, refreshUser } = useUser()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [testRequest, setTestRequest] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const noSeeds = (user?.seeds ?? 0) < 1

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      let url = link.trim()
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`
      const id = await createProject({ title: title.trim(), description: description.trim(), link: url, testRequest: testRequest.trim() })
      await refreshUser()
      navigate(`/project/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="narrow">
      <form className="grove-card form" onSubmit={handleSubmit}>
        <h1 className="grove-heading">🌱 Plant a Project</h1>
        <p className="grove-muted">
          Planting costs <strong>1 Seed</strong>. You have <SeedBadge seeds={user?.seeds ?? 0} />
        </p>

        {noSeeds && (
          <p className="grove-error">
            You’re out of Seeds! <Link to="/">Test someone else’s project</Link> to earn one.
          </p>
        )}

        <div className="field">
          <label className="grove-label" htmlFor="title">Project name</label>
          <input id="title" className="grove-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label className="grove-label" htmlFor="desc">What is it?</label>
          <textarea id="desc" className="grove-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences about your app or website" required />
        </div>
        <div className="field">
          <label className="grove-label" htmlFor="link">Link to try it</label>
          <input id="link" className="grove-input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" required />
        </div>
        <div className="field">
          <label className="grove-label" htmlFor="req">What do you want tested?</label>
          <textarea id="req" className="grove-textarea" value={testRequest} onChange={(e) => setTestRequest(e.target.value)} placeholder="e.g. Is the sign-up flow confusing? Does it work on your phone?" />
        </div>

        {error && <p className="grove-error">{error}</p>}

        <button className="grove-button blossom" type="submit" disabled={busy || noSeeds}>
          {busy ? 'Planting…' : 'Plant it (−1 Seed)'}
        </button>
      </form>
    </div>
  )
}
