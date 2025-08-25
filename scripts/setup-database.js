#!/usr/bin/env node

/**
 * データベーススキーマセットアップスクリプト
 * Supabaseにテーブルを作成します
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and Key are required');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 データベースセットアップを開始します...');
    
    // スキーマファイルを読み込み
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // SQLを実行（複数のステートメントに分割）
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 ${statements.length}個のSQLステートメントを実行します...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`   実行中 (${i + 1}/${statements.length}): ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.warn(`   ⚠️  警告: ${error.message}`);
          // 一部のエラーは無視（テーブルが既に存在する場合など）
        }
      }
    }
    
    console.log('✅ データベースセットアップが完了しました！');
    
    // テーブル作成確認
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('テーブル確認でエラー:', tablesError.message);
    } else {
      console.log('\n📊 作成されたテーブル:');
      const relevantTables = tables.filter(t => 
        ['properties', 'appraisals', 'investors', 'market_data', 'processing_logs'].includes(t.table_name)
      );
      relevantTables.forEach(table => {
        console.log(`   ✓ ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ データベースセットアップでエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// サンプルデータ挿入
async function insertSampleData() {
  try {
    console.log('\n🌱 サンプルデータを挿入します...');
    
    // サンプル物件データ
    const sampleProperties = [
      {
        property_name: 'サンプルマンションA',
        property_type: 'マンション',
        price: 50000000,
        yield_rate: 5.5,
        address: '東京都渋谷区',
        station_name: '渋谷',
        walk_time: 8,
        building_age: 15,
        structure: 'RC',
        data_source: 'テスト'
      },
      {
        property_name: 'サンプルアパートB',
        property_type: 'アパート',
        price: 30000000,
        yield_rate: 6.2,
        address: '大阪府大阪市',
        station_name: '梅田',
        walk_time: 12,
        building_age: 8,
        structure: '木造',
        data_source: 'テスト'
      }
    ];
    
    const { data, error } = await supabase
      .from('properties')
      .insert(sampleProperties);
    
    if (error) {
      console.warn('⚠️  サンプルデータ挿入の警告:', error.message);
    } else {
      console.log('✅ サンプルデータを挿入しました');
    }
    
  } catch (error) {
    console.warn('⚠️  サンプルデータ挿入でエラー:', error.message);
  }
}

// メイン実行
async function main() {
  await setupDatabase();
  await insertSampleData();
  console.log('\n🎉 すべてのセットアップが完了しました！');
  console.log('   Supabaseダッシュボードでテーブルを確認してください：');
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/project/default/editor`);
}

main().catch(console.error);
