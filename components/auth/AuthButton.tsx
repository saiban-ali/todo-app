'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface AuthButtonProps {
  userEmail: string
}

export function AuthButton({ userEmail }: AuthButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-semibold">
          {userEmail[0].toUpperCase()}
        </div>
        <span className="hidden sm:inline">{userEmail}</span>
      </button>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-zinc-200 z-20">
            <div className="p-3 border-b border-zinc-200">
              <p className="text-sm font-medium text-zinc-900">{userEmail}</p>
            </div>
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50"
                onClick={handleSignOut}
                isLoading={isLoading}
              >
                Sign out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
