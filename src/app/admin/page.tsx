import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient()
  
  // データベースの統計情報を取得
  const [propertiesResult, appraisalsResult, investorsResult] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('appraisals').select('*', { count: 'exact', head: true }),
    supabase.from('investors').select('*', { count: 'exact', head: true })
  ])

  const stats = {
    properties: propertiesResult.count || 0,
    appraisals: appraisalsResult.count || 0,
    investors: investorsResult.count || 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            不動産査定システム 管理画面
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            物件データの管理と査定結果の確認ができます
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    🏠
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      物件数
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.properties.toLocaleString()}件
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    📊
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      査定結果
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.appraisals.toLocaleString()}件
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    👥
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      投資家
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.investors.toLocaleString()}名
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メニューカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 物件管理 */}
          <Link href="/admin/properties" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    物件管理
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  物件データの閲覧、追加、編集ができます
                </p>
                <div className="mt-4 text-sm text-blue-600 group-hover:text-blue-800">
                  管理画面へ →
                </div>
              </div>
            </div>
          </Link>

          {/* 査定結果 */}
          <Link href="/admin/appraisals" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-green-600">
                    査定結果
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  査定結果の確認と分析ができます
                </p>
                <div className="mt-4 text-sm text-green-600 group-hover:text-green-800">
                  結果を確認 →
                </div>
              </div>
            </div>
          </Link>

          {/* 投資家管理 */}
          <Link href="/admin/investors" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-purple-600">
                    投資家管理
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  投資家情報と投資条件の管理
                </p>
                <div className="mt-4 text-sm text-purple-600 group-hover:text-purple-800">
                  管理画面へ →
                </div>
              </div>
            </div>
          </Link>

          {/* データ移行 */}
          <Link href="/admin/migration" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-orange-600">
                    データ移行
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  GASからのデータ移行とインポート
                </p>
                <div className="mt-4 text-sm text-orange-600 group-hover:text-orange-800">
                  移行ツール →
                </div>
              </div>
            </div>
          </Link>

          {/* 査定実行 */}
          <Link href="/admin/appraise" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-red-600">
                    査定実行
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  物件の査定を実行して結果を確認
                </p>
                <div className="mt-4 text-sm text-red-600 group-hover:text-red-800">
                  査定開始 →
                </div>
              </div>
            </div>
          </Link>

          {/* システム設定 */}
          <Link href="/admin/settings" className="group">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 group-hover:text-gray-600">
                    システム設定
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  システムの設定と管理
                </p>
                <div className="mt-4 text-sm text-gray-600 group-hover:text-gray-800">
                  設定画面 →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* フッター */}
        <div className="mt-12 text-center text-sm text-gray-500">
          不動産査定システム v1.0 - Powered by Next.js & Supabase
        </div>
      </div>
    </div>
  )
}
