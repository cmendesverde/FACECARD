/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('facecard_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const me = await authService.getCurrentUser()
        setUser(me)
      } catch {
        localStorage.removeItem('facecard_token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [token])

  const applyAuthResult = useCallback((result) => {
    localStorage.setItem('facecard_token', result.token)
    setToken(result.token)
    setUser(result.user)
    return result
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const result = await authService.login({ email, password })
      return applyAuthResult(result)
    },
    [applyAuthResult],
  )

  const loginWithFace = useCallback(
    async (payload) => {
      const result = await authService.loginWithFace(payload)
      return applyAuthResult(result)
    },
    [applyAuthResult],
  )

  const register = useCallback(
    async (payload) => {
      const result = await authService.register(payload)
      return applyAuthResult(result)
    },
    [applyAuthResult],
  )

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout()
      }
    } finally {
      localStorage.removeItem('facecard_token')
      setToken(null)
      setUser(null)
    }
  }, [token])

  const refreshUser = useCallback(async () => {
    const me = await authService.getCurrentUser()
    setUser(me)
    return me
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      loginWithFace,
      register,
      logout,
      refreshUser,
    }),
    [token, user, loading, login, loginWithFace, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

