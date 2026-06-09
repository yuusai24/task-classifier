'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function GenerateInviteCode() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [lastCode, setLastCode] = useState('')

  async function generate() {
    setLoading(true)
    const code = generateCode()
    const supabase = createClient()
    await supabase.from('invite_codes').insert({ code })
    setLastCode(code)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      {lastCode && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
          <span className="text-sm text-emerald-700">発行：</span>
          <span className="font-mono font-bold text-emerald-900 tracking-wider">{lastCode}</span>
          <button
            onClick={() => navigator.clipboard.writeText(lastCode)}
            className="text-xs text-emerald-600 hover:text-emerald-800 ml-1"
          >
            コピー
          </button>
        </div>
      )}
      <button
        onClick={generate}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
      >
        {loading ? '発行中...' : '＋ 招待コードを発行'}
      </button>
    </div>
  )
}
