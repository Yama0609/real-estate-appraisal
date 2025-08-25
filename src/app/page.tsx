import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            不動産査定システム
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            AI駆動の不動産査定とマッチングプラットフォーム
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              管理画面へ
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              物件を探す
            </Link>
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              物件データ管理
            </h3>
            <p className="text-gray-600">
              レインズ・楽待から取得した物件データを統合管理。
              詳細な物件情報と写真を一元化。
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI査定エンジン
            </h3>
            <p className="text-gray-600">
              賃貸・ホテル・オフィス・地価の多角的査定。
              相場データとAIで正確な価値評価。
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              投資家マッチング
            </h3>
            <p className="text-gray-600">
              投資条件に基づく自動マッチング。
              Slackで即座に割安物件をお知らせ。
            </p>
          </div>
        </div>

        {/* システム概要 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            システム概要
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔄 データ収集・統合
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• レインズ（OCR自動読み取り）</li>
                <li>• 楽待（スクレイピング）</li>
                <li>• 重複除去と統合処理</li>
                <li>• リアルタイム更新</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📈 査定・分析機能
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• 賃貸利回り計算</li>
                <li>• ホテル・オフィス査定</li>
                <li>• 地価査定（GIS連携）</li>
                <li>• 割安物件自動抽出</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 技術スタック */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            技術スタック
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS',
              'Google Apps Script', 'Slack API', 'OCR', 'Vercel'
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}