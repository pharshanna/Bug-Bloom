// src/pages/ProfilePage.jsx — my Seeds + my projects. Owned by Person 1.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyProjects } from '../firebase/api'
import { useUser } from './UserContext'
import Sapling from '../components/grove/Sapling'
import SeedBadge from '../components/grove/SeedBadge'

export default function ProfilePage() {
  const { user } = useUser()
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyProjects().then(setProjects).catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <section className="grove-card profile-head">
        <div className="profile-avatar" aria-hidden="true">{user?.name?.[0]?.toUpperCase() || '🌱'}</div>
        <div>
          <h1 className="grove-heading">{user?.name}</h1>
          <p className="grove-muted">{user?.email}</p>
          <SeedBadge seeds={user?.seeds ?? 0} />
        </div>
      </section>

      <div className="page-header">
        <h2 className="grove-heading">My Saplings</h2>
        <Link to="/post" className="grove-button blossom">🌱 Plant a Project</Link>
      </div>

      {error && <p className="grove-error">{error}</p>}
      {!projects && !error && <p className="page-status">Loading…</p>}
      {projects?.length === 0 && (
        <div className="empty">You haven’t planted anything yet. Test a project to earn Seeds, then plant your own! 🌱</div>
      )}

      <div className="project-grid">
        {projects?.map((p) => (
          <Link key={p.id} to={`/project/${p.id}`} className="grove-card project-card project-card--link">
            <Sapling feedbackCount={p.feedbackCount || 0} size="lg" showCount />
            <h3 className="project-card__title">{p.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
