// src/pages/Navbar.jsx — top navigation bar. Owned by Person 1.
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useUser } from './UserContext'
import { logOut } from '../firebase/api'
import SeedBadge from '../components/grove/SeedBadge'

export default function Navbar() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()

  async function handleLogOut() {
    await logOut()
    setUser(null)
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span aria-hidden="true">🐛🌸</span> Bug &amp; Bloom
      </Link>

      {user && (
        <nav className="navbar__links">
          <NavLink to="/" end>Browse</NavLink>
          <NavLink to="/post">Plant a Project</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <SeedBadge seeds={user.seeds} />
          <button className="navbar__logout" onClick={handleLogOut}>Log out</button>
        </nav>
      )}
    </header>
  )
}
