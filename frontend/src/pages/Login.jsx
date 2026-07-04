import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, Mail, Sparkles, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/services/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isForgotPassword) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        setMessage('Password reset link sent to your email.')
      } catch (err) {
        setError(err.message || 'Failed to send password reset email.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Registration successful! Please check your email or sign in.')
        setIsRegister(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to initialize Google login.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0C0C0D] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background flex items-center justify-center p-4">
      {/* Decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md border-border/80 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-card/70">
        <CardHeader className="space-y-2 text-center pb-8 border-b border-border/40">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white font-black text-xl tracking-wider shadow-lg shadow-primary/30">
              C
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            {isForgotPassword 
              ? 'Reset Password' 
              : isRegister 
                ? 'Create an Account' 
                : 'Welcome to Clipper AI'}
          </CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? 'Enter your email to receive a recovery link.' 
              : isRegister 
                ? 'Join Clipper AI to start producing viral short clips.' 
                : 'Analyze YouTube videos and generate viral shorts in seconds.'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 bg-background/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Password
                  </label>
                  {!isRegister && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true)
                        setError('')
                        setMessage('')
                      }} 
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/30"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button type="submit" className="w-full relative group overflow-hidden" disabled={loading}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {isForgotPassword 
                      ? 'Send Recovery Link' 
                      : isRegister 
                        ? 'Register with Email' 
                        : 'Sign In with Email'}
                  </>
                )}
              </span>
            </Button>
            
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false)
                  setError('')
                  setMessage('')
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 justify-center py-1 mt-1 font-semibold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </button>
            ) : (
              <>
                <div className="relative w-full flex items-center justify-center my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60"></div>
                  </div>
                  <span className="relative bg-card px-3 text-[10px] uppercase text-muted-foreground tracking-widest">
                    Or Continue With
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-background/40 hover:bg-secondary border-border"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Sign In with Google
                </Button>

                <div className="text-center text-xs text-muted-foreground mt-2">
                  {isRegister ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(false)
                          setError('')
                          setMessage('')
                        }}
                        className="text-primary hover:underline font-semibold"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsRegister(true)
                          setError('')
                          setMessage('')
                        }}
                        className="text-primary hover:underline font-semibold"
                      >
                        Register
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
