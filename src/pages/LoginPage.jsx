// src/pages/LoginPage.jsx — log in / sign up. Owned by Person 1.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { logIn, signUp } from '../firebase/api'
import { useUser } from './UserContext'

export default function LoginPage() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = mode === 'signup'
        ? await signUp(name.trim(), email.trim(), password)
        : await logIn(email.trim(), password)
      setUser(u)
      navigate('/')
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <div className="login__intro">
        <h1 className="grove-heading login__title">Find the bugs.<br />Watch it bloom.</h1>
        <p className="grove-muted">
          Test other students' projects to earn <strong>Seeds</strong>. Spend Seeds to get your own
          project tested. Every piece of feedback helps a project grow. 🌱
        </p>
      </div>

      <form className="grove-card login__form" onSubmit={handleSubmit}>
        <h2 className="grove-heading">{mode === 'signup' ? 'Join the Grove' : 'Welcome back'}</h2>

        {mode === 'signup' && (
          <div className="field">
            <label className="grove-label" htmlFor="name">Name</label>
            <input id="name" className="grove-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div className="field">
          <label className="grove-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="grove-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label className="grove-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="grove-input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </div>

        {error && <p className="grove-error">{error}</p>}

        <button className="grove-button" type="submit" disabled={busy}>
          {busy ? 'One moment…' : mode === 'signup' ? 'Sign up (+3 free Seeds)' : 'Log in'}
        </button>

        <p className="login__switch">
          {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link-button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError('') }}>
            {mode === 'signup' ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  )
}

function friendlyAuthError(err) {
  const code = err?.code || ''
  if (code.includes('email-already-in-use')) return 'That email already has an account. Try logging in.'
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found'))
    return 'Email or password is incorrect.'
  if (code.includes('weak-password')) return 'Password needs at least 6 characters.'
  if (code.includes('invalid-email')) return 'That email address doesn’t look right.'
  return err?.message || 'Something went wrong. Please try again.'
}
