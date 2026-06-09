'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'invite' | 'account'>('invite')
  const [inviteCode, setInviteCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function checkInviteCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('invite_codes')
      .select('id, used')
      .eq('code', inviteCode.trim().toUpperCase())
      .single()

    if (error || !data) {
      setError('招待コードが見つかりません')
      setLoading(false)
      return
    }
    if (data.used) {
      setError('この招待コードはすでに使用されています')
      setLoading(false)
      return
    }

    setStep('account')
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 招待コードを使用済みにする処理はサーバーサイドで行う
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          invite_code: inviteCode.trim().toUpperCase(),
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step === 'invite' ? 'bg-indigo-600' : 'bg-indigo-600'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step === 'account' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>

        {step === 'invite' ? (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">招待コードを入力</h1>
            <p className="text-gray-500 text-sm mb-8">
              受け取った招待コードを入力してください
            </p>
            <form onSubmit={checkInviteCode} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  招待コード
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  placeholder="XXXXXXXX"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? '確認中...' : '次へ'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">アカウント作成</h1>
            <p className="text-gray-500 text-sm mb-8">プロフィールを設定してください</p>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="山田 花子"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="8文字以上"
                  minLength={8}
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? '登録中...' : 'アカウントを作成'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
