import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

const isMock = supabaseUrl.includes('mock.supabase.co') || !supabaseUrl

let supabaseClient

if (isMock) {
  console.warn('Supabase: Running in MOCK auth mode. Real authentication will be bypassed.')
  
  const listeners = new Set()
  let mockSession = null
  
  try {
    const saved = localStorage.getItem('supabase.auth.mock-session')
    if (saved) {
      mockSession = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to parse mock session:', e)
  }

  const triggerListeners = (event, session) => {
    listeners.forEach(cb => cb(event, session))
  }

  supabaseClient = {
    auth: {
      async getSession() {
        return { data: { session: mockSession }, error: null }
      },
      onAuthStateChange(callback) {
        listeners.add(callback)
        // Immediately fire with current state
        callback(mockSession ? 'SIGNED_IN' : 'SIGNED_OUT', mockSession)
        return {
          data: {
            subscription: {
              unsubscribe() {
                listeners.delete(callback)
              }
            }
          }
        }
      },
      async signInWithPassword({ email, password }) {
        if (!email || !password) {
          return { data: { user: null, session: null }, error: { message: 'Email and password are required' } }
        }
        mockSession = {
          access_token: 'mock-jwt-token-12345',
          user: {
            id: 'mock-user-123',
            email: email,
            user_metadata: {
              full_name: email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
            }
          }
        }
        localStorage.setItem('supabase.auth.mock-session', JSON.stringify(mockSession))
        triggerListeners('SIGNED_IN', mockSession)
        return { data: { user: mockSession.user, session: mockSession }, error: null }
      },
      async signUp({ email, password }) {
        if (!email || !password) {
          return { data: { user: null, session: null }, error: { message: 'Email and password are required' } }
        }
        mockSession = {
          access_token: 'mock-jwt-token-12345',
          user: {
            id: 'mock-user-123',
            email: email,
            user_metadata: {
              full_name: email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
            }
          }
        }
        localStorage.setItem('supabase.auth.mock-session', JSON.stringify(mockSession))
        triggerListeners('SIGNED_IN', mockSession)
        return { data: { user: mockSession.user, session: mockSession }, error: null }
      },
      async signInWithOAuth({ provider }) {
        mockSession = {
          access_token: 'mock-jwt-token-12345',
          user: {
            id: 'mock-user-123',
            email: 'google-user@example.com',
            user_metadata: {
              full_name: 'Google User',
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=google`
            }
          }
        }
        localStorage.setItem('supabase.auth.mock-session', JSON.stringify(mockSession))
        triggerListeners('SIGNED_IN', mockSession)
        return { data: { user: mockSession.user, session: mockSession }, error: null }
      },
      async signOut() {
        mockSession = null
        localStorage.removeItem('supabase.auth.mock-session')
        triggerListeners('SIGNED_OUT', null)
        return { error: null }
      },
      async resetPasswordForEmail(email) {
        return { data: {}, error: null }
      }
    }
  }
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient
