#!/usr/bin/env node

/**
 * テーブル作成スクリプト
 * 必要な全テーブルを自動作成
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

const createTables = async () => {
  console.log('🚀 テーブル作成を開始します...\n');
  
  const tables = [
    {
      name: 'properties',
      sql: `
        CREATE TABLE IF NOT EXISTS properties (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_name TEXT NOT NULL,
          url TEXT,
          property_type TEXT,
          price BIGINT,
          yield_rate DECIMAL(5,2),
          address TEXT,
          railway_line TEXT,
          station_name TEXT,
          walk_time INTEGER,
          building_age INTEGER,
          total_units INTEGER,
          structure TEXT,
          asset_type TEXT,
          land_area DECIMAL(10,2),
          building_area DECIMAL(10,2),
          floors INTEGER,
          special_notes TEXT,
          real_estate_company TEXT,
          data_source TEXT NOT NULL,
          transaction_type TEXT,
          property_rights TEXT,
          land_use_zone TEXT,
          latitude DECIMAL(10,7),
          longitude DECIMAL(11,7),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'appraisals',
      sql: `
        CREATE TABLE IF NOT EXISTS appraisals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
          calculated_rent_yearly BIGINT,
          calculated_yield DECIMAL(5,2),
          market_price BIGINT,
          rental_judgment TEXT,
          hotel_rent_yearly BIGINT,
          hotel_yield DECIMAL(5,2),
          hotel_market_price BIGINT,
          hotel_judgment TEXT,
          office_rent_yearly BIGINT,
          office_yield DECIMAL(5,2),
          office_market_price BIGINT,
          office_judgment TEXT,
          land_price_per_sqm DECIMAL(10,2),
          calculated_land_price BIGINT,
          land_judgment TEXT,
          appraisal_type TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'investors',
      sql: `
        CREATE TABLE IF NOT EXISTS investors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          min_yield DECIMAL(5,2),
          max_price BIGINT,
          preferred_areas TEXT[],
          preferred_property_types TEXT[],
          max_building_age INTEGER,
          min_building_area DECIMAL(10,2),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];
  
  for (const table of tables) {
    try {
      console.log(`📊 ${table.name}テーブルを作成中...`);
      
      // テーブル作成を試行
      const { error } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });
      
      if (error) {
        console.log(`   ⚠️  ${table.name}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table.name}: 作成完了`);
      }
      
      // 作成確認
      const { data, error: checkError } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (!checkError) {
        console.log(`   ✓ ${table.name}: アクセス可能`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${table.name}: エラー - ${error.message}`);
    }
  }
  
  console.log('\n🎉 テーブル作成処理が完了しました！');
  console.log('💡 確認コマンド: npm run check-db');
};

createTables();
