import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        navigate('/')
      } else {
        setAuthenticated(true)
      }

      setLoading(false)
    }

    checkSession()
  }, [navigate])

  if (loading) return <div className="text-center p-8">Loading...</div>
  if (!authenticated) return null

  return children
}