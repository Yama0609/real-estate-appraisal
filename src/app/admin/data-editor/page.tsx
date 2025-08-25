'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DataGrid from '@/components/DataGrid'

interface Property extends Record<string, unknown> {
  id: string
  property_name: string
  url?: string
  property_type: string
  price: number
  yield_rate: number
  address: string
  railway_line: string
  station_name: string
  walk_time: number
  building_age: number
  total_units: number
  structure: string
  asset_type: string
  land_area: number
  building_area: number
  floors: number
  special_notes: string
  real_estate_company: string
  data_source: string
  created_at: string
  updated_at: string
}

const columns = [
  { key: 'property_name', label: '物件名', type: 'text' as const, width: 200 },
  { key: 'property_type', label: '物件種別', type: 'select' as const, width: 120, 
    options: ['マンション', 'アパート', 'オフィス', 'ホテル', '戸建て', 'その他'] },
  { key: 'price', label: '価格（円）', type: 'number' as const, width: 120 },
  { key: 'yield_rate', label: '利回り（%）', type: 'number' as const, width: 100 },
  { key: 'address', label: '所在地', type: 'text' as const, width: 250 },
  { key: 'railway_line', label: '路線名', type: 'text' as const, width: 150 },
  { key: 'station_name', label: '駅名', type: 'text' as const, width: 120 },
  { key: 'walk_time', label: '徒歩（分）', type: 'number' as const, width: 80 },
  { key: 'building_age', label: '築年数', type: 'number' as const, width: 80 },
  { key: 'total_units', label: '総戸数', type: 'number' as const, width: 80 },
  { key: 'structure', label: '建物構造', type: 'select' as const, width: 100,
    options: ['RC', 'SRC', '木造', '鉄骨', 'その他'] },
  { key: 'asset_type', label: 'アセットタイプ', type: 'text' as const, width: 150 },
  { key: 'land_area', label: '土地面積（㎡）', type: 'number' as const, width: 120 },
  { key: 'building_area', label: '建物面積（㎡）', type: 'number' as const, width: 120 },
  { key: 'floors', label: '階数', type: 'number' as const, width: 80 },
  { key: 'special_notes', label: '特記事項', type: 'text' as const, width: 200 },
  { key: 'real_estate_company', label: '不動産会社', type: 'text' as const, width: 150 },
  { key: 'data_source', label: 'データソース', type: 'select' as const, width: 120,
    options: ['レインズ', '楽待', 'その他'] },
  { key: 'url', label: 'URL', type: 'text' as const, width: 200 },
  { key: 'created_at', label: '作成日時', type: 'text' as const, width: 150, editable: false },
]

export default function DataEditorPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchProperties()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties(data || [])
    } catch (error) {
      console.error('データ取得エラー:', error)
      setMessage('データの取得でエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCellChange = async (rowIndex: number, columnKey: string, value: unknown) => {
    try {
      setSaving(true)
      
      // ローカル状態を更新
      const updatedProperties = [...properties]
      updatedProperties[rowIndex] = {
        ...updatedProperties[rowIndex],
        [columnKey]: value
      }
      setProperties(updatedProperties)

      // データベースを更新
      const property = updatedProperties[rowIndex]
      const { error } = await supabase
        .from('properties')
        .update({ [columnKey]: value })
        .eq('id', property.id)

      if (error) throw error

      setMessage('✅ 保存しました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('保存エラー:', error)
      setMessage('❌ 保存でエラーが発生しました')
      setTimeout(() => setMessage(''), 3000)
      // エラー時は元の値に戻す
      fetchProperties()
    } finally {
      setSaving(false)
    }
  }

  const handleRowAdd = async () => {
    try {
      setSaving(true)
      
      const newProperty = {
        property_name: '新しい物件',
        property_type: 'マンション',
        price: 0,
        yield_rate: 0,
        address: '',
        railway_line: '',
        station_name: '',
        walk_time: 0,
        building_age: 0,
        total_units: 0,
        structure: 'RC',
        asset_type: '',
        land_area: 0,
        building_area: 0,
        floors: 0,
        special_notes: '',
        real_estate_company: '',
        data_source: 'その他',
        url: ''
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([newProperty])
        .select()
        .single()

      if (error) throw error

      setProperties([data, ...properties])
      setMessage('✅ 新しい行を追加しました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('行追加エラー:', error)
      setMessage('❌ 行追加でエラーが発生しました')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleRowDelete = async (rowIndex: number) => {
    if (!confirm('この行を削除しますか？')) return

    try {
      setSaving(true)
      
      const property = properties[rowIndex]
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)

      if (error) throw error

      const updatedProperties = properties.filter((_, index) => index !== rowIndex)
      setProperties(updatedProperties)
      
      setMessage('✅ 行を削除しました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('行削除エラー:', error)
      setMessage('❌ 行削除でエラーが発生しました')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    // CSV エクスポート
    const headers = columns.map(col => col.label).join(',')
    const rows = properties.map(property => 
      columns.map(col => {
        const value = property[col.key as keyof Property]
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(',')
    )
    
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `properties_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← 管理画面に戻る
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">📊 データエディター</h1>
              <p className="mt-2 text-lg text-gray-600">
                スプレッドシート風の表編集で物件データを管理
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                📊 CSV出力
              </button>
              <button
                onClick={fetchProperties}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                🔄 再読み込み
              </button>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* ローディング状態 */}
        {saving && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm">
            💾 保存中...
          </div>
        )}

        {/* データグリッド */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <DataGrid
            columns={columns}
            data={properties}
            onCellChange={handleCellChange}
            onRowAdd={handleRowAdd}
            onRowDelete={handleRowDelete}
            className="h-[600px]"
          />
        </div>

        {/* 操作ガイド */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 操作ガイド</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>セル編集</strong>: セルをクリックして直接編集</li>
            <li>• <strong>保存</strong>: Enter キーまたは他のセルをクリックで自動保存</li>
            <li>• <strong>キャンセル</strong>: Escape キーで編集をキャンセル</li>
            <li>• <strong>行操作</strong>: ツールバーの「行追加」「行削除」ボタンを使用</li>
            <li>• <strong>データ出力</strong>: 「CSV出力」ボタンでデータをダウンロード</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
