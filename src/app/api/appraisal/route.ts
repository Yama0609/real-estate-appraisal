import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AppraisalLogic } from '@/lib/appraisal'

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 物件データを取得
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // 査定を実行
    const appraisalResult = AppraisalLogic.performAppraisal({
      building_area: property.building_area || 0,
      station_name: property.station_name || '',
      property_type: property.property_type || '',
      building_age: property.building_age || 0,
      price: property.price || 0,
    })

    // 査定結果をデータベースに保存
    const { data: savedAppraisal, error: saveError } = await supabase
      .from('appraisals')
      .insert({
        property_id: propertyId,
        calculated_rent_yearly: appraisalResult.calculatedRentYearly,
        calculated_yield: appraisalResult.calculatedYield,
        market_price: appraisalResult.marketPrice,
        rental_judgment: appraisalResult.judgment.judgment,
        appraisal_type: 'rental'
      })
      .select()
      .single()

    if (saveError) {
      console.error('査定結果保存エラー:', saveError)
      return NextResponse.json(
        { error: 'Failed to save appraisal result' },
        { status: 500 }
      )
    }

    // 処理ログを記録
    await supabase
      .from('processing_logs')
      .insert({
        category: '査定処理',
        message: `物件「${property.property_name}」の査定を実行しました`,
        level: 'SUCCESS',
        property_id: propertyId
      })

    return NextResponse.json({
      success: true,
      appraisal: savedAppraisal,
      result: appraisalResult
    })

  } catch (error) {
    console.error('査定API エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 一括査定API
export async function PUT() {
  try {
    const supabase = await createClient()

    // 査定結果がない物件を取得
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        *,
        appraisals!left(id)
      `)
      .is('appraisals.id', null)
      .limit(10) // 一度に10件まで

    if (propertiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      )
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No properties to appraise',
        processed: 0
      })
    }

    const appraisalResults = []

    // 各物件の査定を実行
    for (const property of properties) {
      try {
        const result = AppraisalLogic.performAppraisal({
          building_area: property.building_area || 0,
          station_name: property.station_name || '',
          property_type: property.property_type || '',
          building_age: property.building_age || 0,
          price: property.price || 0,
        })

        // 査定結果を保存
        const { data: savedAppraisal, error: saveError } = await supabase
          .from('appraisals')
          .insert({
            property_id: property.id,
            calculated_rent_yearly: result.calculatedRentYearly,
            calculated_yield: result.calculatedYield,
            market_price: result.marketPrice,
            rental_judgment: result.judgment.judgment,
            appraisal_type: 'rental'
          })
          .select()
          .single()

        if (!saveError) {
          appraisalResults.push({
            propertyId: property.id,
            propertyName: property.property_name,
            result: savedAppraisal
          })
        }
      } catch (error) {
        console.error(`物件 ${property.id} の査定でエラー:`, error)
      }
    }

    // 処理ログを記録
    await supabase
      .from('processing_logs')
      .insert({
        category: '一括査定',
        message: `${appraisalResults.length}件の物件を一括査定しました`,
        level: 'SUCCESS'
      })

    return NextResponse.json({
      success: true,
      processed: appraisalResults.length,
      results: appraisalResults
    })

  } catch (error) {
    console.error('一括査定API エラー:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
