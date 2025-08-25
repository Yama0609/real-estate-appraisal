#!/usr/bin/env node

/**
 * サンプルデータ追加スクリプト
 * リアルな不動産データでWebアプリの動作確認
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL and Key are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// リアルなサンプル物件データ
const sampleProperties = [
  {
    property_name: 'パークマンション渋谷',
    url: 'https://example.com/property/1',
    property_type: 'マンション',
    price: 85000000,
    yield_rate: 5.2,
    address: '東京都渋谷区神南1-15-3',
    railway_line: 'JR山手線',
    station_name: '渋谷',
    walk_time: 8,
    building_age: 12,
    total_units: 45,
    structure: 'RC',
    asset_type: '賃貸マンション',
    land_area: 280.5,
    building_area: 1250.0,
    floors: 8,
    special_notes: '駅近、コンビニ徒歩2分',
    real_estate_company: '東京不動産株式会社',
    data_source: '楽待',
    latitude: 35.6598,
    longitude: 139.7006
  },
  {
    property_name: 'グランドメゾン新宿',
    url: 'https://example.com/property/2',
    property_type: 'マンション',
    price: 120000000,
    yield_rate: 4.8,
    address: '東京都新宿区西新宿3-7-1',
    railway_line: 'JR山手線',
    station_name: '新宿',
    walk_time: 5,
    building_age: 8,
    total_units: 68,
    structure: 'SRC',
    asset_type: '賃貸マンション',
    land_area: 450.2,
    building_area: 2100.0,
    floors: 12,
    special_notes: '高層階、眺望良好',
    real_estate_company: '新宿プロパティ',
    data_source: 'レインズ',
    transaction_type: '媒介',
    property_rights: '所有権',
    land_use_zone: '商業地域',
    latitude: 35.6896,
    longitude: 139.6917
  },
  {
    property_name: 'サンシャイン池袋アパート',
    property_type: 'アパート',
    price: 45000000,
    yield_rate: 6.5,
    address: '東京都豊島区東池袋1-50-35',
    railway_line: 'JR山手線',
    station_name: '池袋',
    walk_time: 12,
    building_age: 25,
    total_units: 12,
    structure: '木造',
    asset_type: '賃貸アパート',
    land_area: 180.0,
    building_area: 480.0,
    floors: 3,
    special_notes: 'リノベーション済み',
    real_estate_company: '池袋ハウジング',
    data_source: '楽待',
    latitude: 35.7295,
    longitude: 139.7109
  },
  {
    property_name: '大阪ビジネスホテル',
    property_type: 'ホテル',
    price: 180000000,
    yield_rate: 7.2,
    address: '大阪府大阪市北区梅田2-4-12',
    railway_line: 'JR東海道本線',
    station_name: '大阪',
    walk_time: 6,
    building_age: 15,
    total_units: 85,
    structure: 'SRC',
    asset_type: 'ビジネスホテル',
    land_area: 520.0,
    building_area: 3200.0,
    floors: 10,
    special_notes: 'インバウンド需要高',
    real_estate_company: '関西不動産投資',
    data_source: 'レインズ',
    transaction_type: '売主',
    property_rights: '所有権',
    latitude: 34.7024,
    longitude: 135.4959
  },
  {
    property_name: '名古屋オフィスビル',
    property_type: 'オフィス',
    price: 250000000,
    yield_rate: 5.8,
    address: '愛知県名古屋市中区錦3-6-29',
    railway_line: '地下鉄東山線',
    station_name: '栄',
    walk_time: 3,
    building_age: 10,
    total_units: 35,
    structure: 'SRC',
    asset_type: 'オフィスビル',
    land_area: 380.0,
    building_area: 2800.0,
    floors: 9,
    special_notes: '駅直結、テナント稼働率95%',
    real_estate_company: '中部商事不動産',
    data_source: 'レインズ',
    transaction_type: '代理',
    property_rights: '所有権',
    land_use_zone: '商業地域',
    latitude: 35.1677,
    longitude: 136.9089
  }
];

// サンプル投資家データ
const sampleInvestors = [
  {
    name: '田中太郎',
    email: 'tanaka@example.com',
    phone: '090-1234-5678',
    min_yield: 5.0,
    max_price: 100000000,
    preferred_areas: ['東京都', '神奈川県'],
    preferred_property_types: ['マンション', 'アパート'],
    max_building_age: 20,
    min_building_area: 500.0
  },
  {
    name: '佐藤花子',
    email: 'sato@example.com',
    phone: '080-9876-5432',
    min_yield: 6.0,
    max_price: 200000000,
    preferred_areas: ['大阪府', '京都府'],
    preferred_property_types: ['ホテル', 'オフィス'],
    max_building_age: 15,
    min_building_area: 1000.0
  },
  {
    name: '山田次郎',
    email: 'yamada@example.com',
    phone: '070-5555-1234',
    min_yield: 4.5,
    max_price: 300000000,
    preferred_areas: ['愛知県', '静岡県'],
    preferred_property_types: ['オフィス'],
    max_building_age: 10,
    min_building_area: 2000.0
  }
];

async function addSampleData() {
  console.log('🌱 サンプルデータを追加します...\n');
  
  try {
    // 1. 物件データを追加
    console.log('🏠 物件データを追加中...');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .insert(sampleProperties)
      .select();
    
    if (propError) {
      console.error('❌ 物件データ追加エラー:', propError.message);
      return;
    }
    
    console.log(`✅ ${properties.length}件の物件データを追加しました`);
    
    // 2. 投資家データを追加
    console.log('👥 投資家データを追加中...');
    const { data: investors, error: invError } = await supabase
      .from('investors')
      .insert(sampleInvestors)
      .select();
    
    if (invError) {
      console.error('❌ 投資家データ追加エラー:', invError.message);
      return;
    }
    
    console.log(`✅ ${investors.length}名の投資家データを追加しました`);
    
    // 3. サンプル査定結果を追加
    console.log('📊 査定結果を追加中...');
    const sampleAppraisals = properties.map(property => ({
      property_id: property.id,
      calculated_rent_yearly: Math.floor(property.price * property.yield_rate / 100),
      calculated_yield: property.yield_rate,
      market_price: Math.floor(property.price * (0.9 + Math.random() * 0.2)), // ±10%の変動
      rental_judgment: property.yield_rate > 6.0 ? '割安' : property.yield_rate > 5.0 ? '適正' : '割高',
      appraisal_type: 'rental'
    }));
    
    const { data: appraisals, error: appError } = await supabase
      .from('appraisals')
      .insert(sampleAppraisals)
      .select();
    
    if (appError) {
      console.error('❌ 査定データ追加エラー:', appError.message);
      return;
    }
    
    console.log(`✅ ${appraisals.length}件の査定結果を追加しました`);
    
    // 4. 処理ログを追加
    console.log('📝 処理ログを追加中...');
    const sampleLogs = [
      {
        category: 'データ移行',
        message: 'サンプルデータの追加が完了しました',
        level: 'SUCCESS'
      },
      {
        category: '査定処理',
        message: '自動査定処理を実行しました',
        level: 'INFO'
      }
    ];
    
    const { error: logError } = await supabase
      .from('processing_logs')
      .insert(sampleLogs);
    
    if (logError) {
      console.error('❌ ログデータ追加エラー:', logError.message);
    } else {
      console.log('✅ 処理ログを追加しました');
    }
    
    // 5. 結果サマリー
    console.log('\n🎉 サンプルデータ追加が完了しました！');
    console.log('📊 追加されたデータ:');
    console.log(`   物件: ${properties.length}件`);
    console.log(`   投資家: ${investors.length}名`);
    console.log(`   査定結果: ${appraisals.length}件`);
    console.log('\n💡 次のステップ:');
    console.log('   • http://localhost:3000/admin でデータを確認');
    console.log('   • npm run check-db でデータベース状況確認');
    
  } catch (error) {
    console.error('❌ サンプルデータ追加でエラーが発生しました:', error.message);
  }
}

addSampleData();
