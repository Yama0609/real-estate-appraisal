'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Property {
  id: string
  property_name: string
  url?: string
  property_type: string
  price: number
  yield_rate: number
  address: string
  station_name: string
  walk_time: number
  building_age: number
  structure: string
  data_source: string
  created_at: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient()
        const { data: properties, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('物件データ取得エラー:', error)
        } else {
          setProperties(properties || [])
        }
      } catch (error) {
        console.error('物件データ取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // 判定色の取得
  const getYieldColor = (yield_rate: number) => {
    if (yield_rate >= 6.0) return 'text-green-600 bg-green-50'
    if (yield_rate >= 5.0) return 'text-blue-600 bg-blue-50'
    return 'text-red-600 bg-red-50'
  }

  const getYieldLabel = (yield_rate: number) => {
    if (yield_rate >= 6.0) return '割安'
    if (yield_rate >= 5.0) return '適正'
    return '割高'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← 管理画面に戻る
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">物件一覧</h1>
              <p className="mt-2 text-lg text-gray-600">
                登録されている物件データの一覧です
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">総物件数</div>
              <div className="text-2xl font-bold text-blue-600">
                {properties?.length || 0}件
              </div>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">平均利回り</div>
            <div className="text-xl font-bold text-blue-600">
              {properties && properties.length > 0
                ? (properties.reduce((sum, p) => sum + (p.yield_rate || 0), 0) / properties.length).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">平均価格</div>
            <div className="text-xl font-bold text-green-600">
              {properties && properties.length > 0
                ? Math.floor(properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length / 10000)
                : 0}万円
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">割安物件</div>
            <div className="text-xl font-bold text-red-600">
              {properties?.filter(p => p.yield_rate >= 6.0).length || 0}件
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">データソース</div>
            <div className="text-sm text-gray-600">
              楽待: {properties?.filter(p => p.data_source === '楽待').length || 0}件<br/>
              レインズ: {properties?.filter(p => p.data_source === 'レインズ').length || 0}件
            </div>
          </div>
        </div>

        {/* 物件一覧テーブル */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    物件情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格・利回り
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    立地
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    建物情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    判定
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties && properties.length > 0 ? (
                  properties.map((property: Property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {property.property_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.property_type}
                          </div>
                          <div className="text-xs text-blue-600">
                            {property.data_source}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.price ? `${Math.floor(property.price / 10000)}万円` : '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          利回り: {property.yield_rate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {property.station_name}駅
                        </div>
                        <div className="text-sm text-gray-500">
                          徒歩{property.walk_time}分
                        </div>
                        <div className="text-xs text-gray-400">
                          {property.address?.substring(0, 20)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          築{property.building_age}年
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.structure}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getYieldColor(property.yield_rate)}`}>
                          {getYieldLabel(property.yield_rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/properties/${property.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          詳細
                        </Link>
                        {property.url && (
                          <a
                            href={property.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            元サイト
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      物件データがありません
                      <div className="mt-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          再読み込み
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  )
}
