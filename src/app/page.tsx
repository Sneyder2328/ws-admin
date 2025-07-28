'use client'

import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "@/components/auth/LoginButton";
import { UserProfile } from "@/components/auth/UserProfile";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">WhatsApp Admin Panel</h1>
        {user ? <UserProfile /> : <LoginButton />}
      </header>
      
      <main className="flex flex-col gap-8">
        {user ? (
          <div>
            <h2 className="text-xl mb-4">Welcome to your admin panel!</h2>
            <p>You are successfully logged in with Firebase Auth.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">Please sign in to continue</h2>
            <p>Use the Sign in with Google button above to access the admin panel.</p>
          </div>
        )}
      </main>
    </div>
  );
}
