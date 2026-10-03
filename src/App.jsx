// src/App.jsx — routes + navbar. Owned by Person 1.
import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider, useUser } from './pages/UserContext'
import Navbar from './pages/Navbar'
import LoginPage from './pages/LoginPage'
import BrowsePage from './pages/BrowsePage'
import ProjectPage from './pages/ProjectPage'
import TestPage from './pages/TestPage'
import PostProjectPage from './pages/PostProjectPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'

// Sends people to /login if they're not logged in.
function RequireLogin({ children }) {
  const { user, loading } = useUser()
  if (loading) return <p className="page-status">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <UserProvider>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RequireLogin><BrowsePage /></RequireLogin>} />
          <Route path="/project/:id" element={<RequireLogin><ProjectPage /></RequireLogin>} />
          <Route path="/project/:id/test" element={<RequireLogin><TestPage /></RequireLogin>} />
          <Route path="/post" element={<RequireLogin><PostProjectPage /></RequireLogin>} />
          <Route path="/profile" element={<RequireLogin><ProfilePage /></RequireLogin>} />
          <Route path="/messages" element={<RequireLogin><MessagesPage /></RequireLogin>} />
          <Route path="/messages/:userId" element={<RequireLogin><MessagesPage /></RequireLogin>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </UserProvider>
  )
}
