'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: string
  property_name: string
  property_type: string
  price: number
  yield_rate: number
  address: string
  station_name: string
  building_age: number
  building_area: number
}

interface AppraisalResult {
  id: string
  property_id: string
  calculated_rent_yearly: number
  calculated_yield: number
  market_price: number
  rental_judgment: string
  created_at: string
}

export default function AppraisePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [appraisals, setAppraisals] = useState<AppraisalResult[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [message, setMessage] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 物件データを取得
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (propertiesError) throw propertiesError

      // 査定結果を取得
      const { data: appraisalsData, error: appraisalsError } = await supabase
        .from('appraisals')
        .select('*')
        .order('created_at', { ascending: false })

      if (appraisalsError) throw appraisalsError

      setProperties(propertiesData || [])
      setAppraisals(appraisalsData || [])
    } catch (error) {
      console.error('データ取得エラー:', error)
      setMessage('データの取得でエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSingleAppraisal = async () => {
    if (!selectedProperty) {
      setMessage('物件を選択してください')
      return
    }

    setProcessing(true)
    setMessage('')

    try {
      const response = await fetch('/api/appraisal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: selectedProperty
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('査定が完了しました！')
        fetchData() // データを再取得
      } else {
        setMessage(`査定でエラーが発生しました: ${result.error}`)
      }
    } catch (error) {
      console.error('査定エラー:', error)
      setMessage('査定の実行でエラーが発生しました')
    } finally {
      setProcessing(false)
    }
  }

  const handleBulkAppraisal = async () => {
    setProcessing(true)
    setMessage('')

    try {
      const response = await fetch('/api/appraisal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`一括査定が完了しました！${result.processed}件の物件を処理しました。`)
        fetchData() // データを再取得
      } else {
        setMessage(`一括査定でエラーが発生しました: ${result.error}`)
      }
    } catch (error) {
      console.error('一括査定エラー:', error)
      setMessage('一括査定の実行でエラーが発生しました')
    } finally {
      setProcessing(false)
    }
  }

  const getJudgmentColor = (judgment: string) => {
    switch (judgment) {
      case '割安': return 'text-green-600 bg-green-50'
      case '適正': return 'text-blue-600 bg-blue-50'
      case '割高': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </div>
    )
  }

  const unappraisedProperties = properties.filter(property => 
    !appraisals.some(appraisal => appraisal.property_id === property.id)
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← 管理画面に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">査定実行</h1>
          <p className="mt-2 text-lg text-gray-600">
            物件の査定を実行して投資価値を評価します
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  🏠
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">総物件数</div>
                  <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  ✅
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">査定済み</div>
                  <div className="text-2xl font-bold text-gray-900">{appraisals.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                  ⏳
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">未査定</div>
                  <div className="text-2xl font-bold text-gray-900">{unappraisedProperties.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  💎
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">割安物件</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {appraisals.filter(a => a.rental_judgment === '割安').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 査定実行セクション */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">査定実行</h2>
          
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.includes('エラー') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 個別査定 */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">個別査定</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  査定する物件を選択
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={processing}
                >
                  <option value="">物件を選択してください</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.property_name} - {property.property_type}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSingleAppraisal}
                disabled={processing || !selectedProperty}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? '査定中...' : '査定実行'}
              </button>
            </div>

            {/* 一括査定 */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">一括査定</h3>
              <p className="text-sm text-gray-600 mb-4">
                未査定の物件をまとめて査定します（最大10件）
              </p>
              <button
                onClick={handleBulkAppraisal}
                disabled={processing || unappraisedProperties.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? '一括査定中...' : `一括査定実行 (${Math.min(unappraisedProperties.length, 10)}件)`}
              </button>
            </div>
          </div>
        </div>

        {/* 査定結果一覧 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">最新の査定結果</h2>
          </div>
          
          {appraisals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      物件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      実売価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      査定価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      算出利回り
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      判定
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      査定日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appraisals.slice(0, 10).map((appraisal) => {
                    const property = properties.find(p => p.id === appraisal.property_id)
                    return (
                      <tr key={appraisal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {property?.property_name || '不明'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property?.property_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property?.price ? `${Math.floor(property.price / 10000)}万円` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Math.floor(appraisal.market_price / 10000)}万円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {appraisal.calculated_yield.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getJudgmentColor(appraisal.rental_judgment)}`}>
                            {appraisal.rental_judgment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(appraisal.created_at).toLocaleString('ja-JP')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              査定結果がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
