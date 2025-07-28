'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export const LoginButton = () => {
  const { signInWithGoogle } = useAuth()

  return (
    <Button onClick={signInWithGoogle} variant="outline">
      Sign in with Google
    </Button>
  )
}