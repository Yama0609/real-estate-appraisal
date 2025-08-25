#!/usr/bin/env node

/**
 * データベース確認スクリプト
 * ローカルからSupabaseのテーブル状況を確認
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

async function checkDatabase() {
  console.log('🔍 データベース状況を確認中...\n');
  
  try {
    // 1. 全テーブル一覧を取得
    console.log('📊 テーブル一覧:');
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
      });
    
    if (tablesError) {
      console.log('⚠️  テーブル確認でエラー:', tablesError.message);
      
      // 代替方法: 直接テーブルにアクセスして確認
      console.log('\n🔄 代替方法でテーブル確認中...');
      
      const targetTables = ['properties', 'appraisals', 'investors', 'market_data', 'processing_logs'];
      
      for (const tableName of targetTables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`   ❌ ${tableName}: 存在しません`);
          } else {
            console.log(`   ✅ ${tableName}: 存在 (${count || 0}件のデータ)`);
          }
        } catch (e) {
          console.log(`   ❌ ${tableName}: 存在しません`);
        }
      }
    } else {
      if (tables && Array.isArray(tables)) {
        tables.forEach(table => {
          console.log(`   ✅ ${table.table_name}`);
        });
      }
    }
    
    // 2. propertiesテーブルの構造確認
    console.log('\n🏠 propertiesテーブルの詳細:');
    try {
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);
      
      if (propError) {
        console.log('   ❌ propertiesテーブルが存在しません');
        console.log('   💡 以下のコマンドでテーブルを作成してください:');
        console.log('      npm run create-tables');
      } else {
        console.log('   ✅ propertiesテーブルが存在します');
        
        // サンプルデータを確認
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
        
        console.log(`   📊 データ件数: ${count || 0}件`);
        
        if (properties && properties.length > 0) {
          console.log('   📝 最新データの例:');
          const latest = properties[0];
          console.log(`      物件名: ${latest.property_name || 'なし'}`);
          console.log(`      価格: ${latest.price ? latest.price.toLocaleString() + '円' : 'なし'}`);
          console.log(`      利回り: ${latest.yield_rate || 'なし'}%`);
        }
      }
    } catch (e) {
      console.log('   ❌ propertiesテーブルにアクセスできません');
    }
    
    // 3. 接続確認
    console.log('\n🌐 Supabase接続情報:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   プロジェクトID: ${supabaseUrl.split('//')[1].split('.')[0]}`);
    
    console.log('\n🎯 次のステップ:');
    console.log('   • テーブルが存在しない場合: npm run create-tables');
    console.log('   • データを追加する場合: npm run add-sample-data');
    console.log('   • Webアプリを起動: npm run dev');
    
  } catch (error) {
    console.error('❌ データベース確認でエラー:', error.message);
  }
}

checkDatabase();
