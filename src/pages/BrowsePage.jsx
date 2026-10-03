// src/pages/BrowsePage.jsx — grid of all projects. Owned by Person 1.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects } from '../firebase/api'
import { useUser } from './UserContext'
import Sapling from '../components/grove/Sapling'

export default function BrowsePage() {
  const { user } = useUser()
  const [projects, setProjects] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects().then(setProjects).catch((err) => setError(err.message))
  }, [])

  const filtered = (projects || []).filter((p) =>
    `${p.title} ${p.description} ${p.ownerName}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="grove-heading">The Grove</h1>
          <p className="grove-muted">Test a project to earn a Seed. Every test helps a sapling grow.</p>
        </div>
        <Link to="/post" className="grove-button blossom">🌱 Plant a Project</Link>
      </div>

      <input
        className="grove-input search"
        placeholder="Search projects…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="grove-error">{error}</p>}
      {!projects && !error && <p className="page-status">Loading projects…</p>}
      {projects && filtered.length === 0 && (
        <div className="empty">
          {projects.length === 0
            ? 'No projects yet. Be the first to plant one! 🌱'
            : 'No projects match your search.'}
        </div>
      )}

      <div className="project-grid">
        {filtered.map((p) => {
          const isMine = p.ownerId === user?.id
          return (
            <article key={p.id} className="grove-card project-card">
              <div className="project-card__top">
                <div>
                  <h2 className="project-card__title">{p.title}</h2>
                  <p className="project-card__owner">by {p.ownerName}{isMine && ' (you)'}</p>
                </div>
                <Sapling feedbackCount={p.feedbackCount || 0} size="sm" />
              </div>
              <p className="project-card__desc">{p.description}</p>
              <div className="project-card__actions">
                <Link to={`/project/${p.id}`} className="grove-button secondary">View</Link>
                {!isMine && (
                  <Link to={`/project/${p.id}/test`} className="grove-button">Test it (+1 Seed)</Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
