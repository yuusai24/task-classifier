import { createClient } from '@/lib/supabase/server'
import { GenerateInviteCode } from '@/components/admin/GenerateInviteCode'
import { InviteCode } from '@/types/database'

export default async function InviteCodesPage() {
  const supabase = await createClient()

  const { data: codes } = await supabase
    .from('invite_codes')
    .select('*, profiles(display_name, email)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">招待コード管理</h2>
          <p className="text-sm text-gray-500 mt-1">コードを発行して受講生を招待できます</p>
        </div>
        <GenerateInviteCode />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-600">招待コード</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">状態</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">使用者</th>
              <th className="text-left px-5 py-3 font-medium text-gray-600">発行日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {codes?.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  招待コードがまだありません
                </td>
              </tr>
            )}
            {codes?.map((code: InviteCode & { profiles?: { display_name: string; email: string } | null }) => (
              <tr key={code.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono font-bold tracking-wider text-gray-900">
                  {code.code}
                </td>
                <td className="px-5 py-4">
                  {code.used ? (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">使用済み</span>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">未使用</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {code.profiles ? (
                    <span>{code.profiles.display_name} <span className="text-gray-400">({code.profiles.email})</span></span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-400">
                  {new Date(code.created_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
