'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'

export const UserProfile = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
        <AvatarFallback>
          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.displayName}</span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <Button onClick={logout} variant="outline" size="sm">
        Sign Out
      </Button>
    </div>
  )
}