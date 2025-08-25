'use client'

import { useState, useRef, useEffect } from 'react'

interface Column {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  options?: string[]
  width?: number
  editable?: boolean
}

interface DataGridProps<T = Record<string, unknown>> {
  columns: Column[]
  data: T[]
  onCellChange: (rowIndex: number, columnKey: string, value: unknown) => void
  onRowAdd?: () => void
  onRowDelete?: (rowIndex: number) => void
  className?: string
}

export default function DataGrid<T extends Record<string, unknown>>({
  columns,
  data,
  onCellChange,
  onRowAdd,
  onRowDelete,
  className = ''
}: DataGridProps<T>) {
  const [selectedCell, setSelectedCell] = useState<{row: number, col: string} | null>(null)
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingCell])

  const handleCellClick = (rowIndex: number, columnKey: string, currentValue: unknown) => {
    const column = columns.find(col => col.key === columnKey)
    if (column?.editable === false) return

    setSelectedCell({ row: rowIndex, col: columnKey })
    setEditingCell({ row: rowIndex, col: columnKey })
    setEditValue(currentValue?.toString() || '')
  }

  const handleCellSave = () => {
    if (!editingCell) return

    const column = columns.find(col => col.key === editingCell.col)
    let finalValue: unknown = editValue

    // 型変換
    if (column?.type === 'number') {
      finalValue = editValue === '' ? null : Number(editValue)
    }

    onCellChange(editingCell.row, editingCell.col, finalValue)
    setEditingCell(null)
    setSelectedCell(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setSelectedCell(null)
    }
  }

  const formatCellValue = (value: unknown, column: Column): string => {
    if (value === null || value === undefined || value === '') return ''
    
    switch (column.type) {
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value)
      case 'date':
        return value instanceof Date ? value.toLocaleDateString('ja-JP') : String(value)
      default:
        return String(value)
    }
  }

  const renderCell = (rowIndex: number, column: Column, value: unknown) => {
    const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === column.key
    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column.key

    if (isEditing) {
      if (column.type === 'select' && column.options) {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={handleKeyDown}
            className="w-full h-full px-1 border-2 border-blue-500 outline-none"
            autoFocus
          >
            <option value="">選択してください</option>
            {column.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      }

      return (
        <input
          ref={inputRef}
          type={column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={handleKeyDown}
          className="w-full h-full px-1 border-2 border-blue-500 outline-none"
        />
      )
    }

    return (
      <div
        className={`w-full h-full px-2 py-1 cursor-cell ${
          isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-200'
        } ${column.editable === false ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
        onClick={() => handleCellClick(rowIndex, column.key, value)}
      >
        {formatCellValue(value, column)}
      </div>
    )
  }

  return (
    <div className={`overflow-auto border border-gray-300 ${className}`}>
      {/* ツールバー */}
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex gap-2">
        {onRowAdd && (
          <button
            onClick={onRowAdd}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            ➕ 行追加
          </button>
        )}
        {onRowDelete && selectedCell && (
          <button
            onClick={() => onRowDelete(selectedCell.row)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            🗑️ 行削除
          </button>
        )}
        <div className="text-sm text-gray-600 flex items-center">
          {data.length}件のデータ
        </div>
      </div>

      {/* グリッドテーブル */}
      <div className="min-w-full">
        {/* ヘッダー */}
        <div className="flex bg-gray-50 border-b border-gray-300 sticky top-0">
          <div className="w-12 px-2 py-2 text-center text-sm font-medium text-gray-700 border-r border-gray-300">
            #
          </div>
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-2 py-2 text-sm font-medium text-gray-700 border-r border-gray-300"
              style={{ width: column.width || 150, minWidth: column.width || 150 }}
            >
              {column.label}
              {column.editable === false && <span className="text-xs text-gray-400 ml-1">(読取専用)</span>}
            </div>
          ))}
        </div>

        {/* データ行 */}
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex border-b border-gray-200 hover:bg-gray-50">
            <div className="w-12 px-2 py-1 text-center text-sm text-gray-500 border-r border-gray-200 bg-gray-50">
              {rowIndex + 1}
            </div>
            {columns.map((column) => (
              <div
                key={column.key}
                className="border-r border-gray-200"
                style={{ width: column.width || 150, minWidth: column.width || 150, height: 32 }}
              >
                {renderCell(rowIndex, column, row[column.key])}
              </div>
            ))}
          </div>
        ))}

        {/* 空の状態 */}
        {data.length === 0 && (
          <div className="flex items-center justify-center py-8 text-gray-500">
            データがありません
            {onRowAdd && (
              <button
                onClick={onRowAdd}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                最初の行を追加
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
