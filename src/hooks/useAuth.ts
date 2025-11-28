import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { api, User } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile()
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadUserProfile()
        } else {
          setUser(null)
          setLoading(false)
        }
      })()
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async () => {
    try {
      const profile = await api.getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: newUser } = await api.loginWithEmail(email, password)
      setUser(newUser)
      return { success: true }
    } catch (error: any) {
      console.error('Email login failed:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const registerWithEmail = async (email: string, password: string, username: string) => {
    try {
      setLoading(true)
      const { user: newUser } = await api.registerWithEmail(email, password, username)
      setUser(newUser)
      return { success: true }
    } catch (error: any) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const loginAsGuest = async () => {
    try {
      setLoading(true)
      const { user: newUser } = await api.loginAsGuest()
      setUser(newUser)
      return { success: true }
    } catch (error: any) {
      console.error('Guest login failed:', error)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      await api.loginWithGoogle()
      return { success: true }
    } catch (error: any) {
      console.error('Google login failed:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
    loginWithGoogle,
    logout
  }
}
