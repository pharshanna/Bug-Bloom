// src/pages/UserContext.jsx — keeps track of who is logged in (and their Seeds) for every page.
// Owned by Person 1.
//
// In any page:  const { user, refreshUser } = useUser()
//   user        → { id, name, email, seeds } or null
//   refreshUser → call after anything that changes Seeds (posting, testing)
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getCurrentUser } from '../firebase/api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const u = await getCurrentUser()
      setUser(u)
      return u
    } catch (err) {
      console.error(err)
      setUser(null)
      return null
    }
  }, [])

  // check who is logged in when the app first loads
  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  return useContext(UserContext)
}
