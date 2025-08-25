-- ==========================================
-- 不動産査定システム データベーススキーマ
-- ==========================================

-- 1. 物件テーブル（統合物件データ）
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本情報
  property_name TEXT NOT NULL,
  url TEXT,
  property_type TEXT, -- マンション、アパート、戸建て等
  price BIGINT, -- 価格（円）
  yield_rate DECIMAL(5,2), -- 利回り（%）
  
  -- 所在地情報
  address TEXT,
  railway_line TEXT, -- 路線名
  station_name TEXT, -- 駅名
  walk_time INTEGER, -- 徒歩時間（分）
  
  -- 建物情報
  building_age INTEGER, -- 築年数
  total_units INTEGER, -- 総戸数
  structure TEXT, -- 建物構造（RC、木造等）
  asset_type TEXT, -- アセットタイプ
  land_area DECIMAL(10,2), -- 土地面積（㎡）
  building_area DECIMAL(10,2), -- 建物面積（㎡）
  floors INTEGER, -- 階数
  
  -- その他
  special_notes TEXT, -- 特記事項
  real_estate_company TEXT, -- 掲載不動産会社名
  
  -- データソース情報
  data_source TEXT NOT NULL, -- 'レインズ' or '楽待'
  
  -- レインズ固有フィールド
  transaction_type TEXT, -- 取引態様（売主、代理、媒介）
  property_rights TEXT, -- 権利（所有権、借地権等）
  land_use_zone TEXT, -- 用途地域
  
  -- 位置情報（地価査定用）
  latitude DECIMAL(10,7), -- 緯度
  longitude DECIMAL(11,7), -- 経度
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 査定結果テーブル
CREATE TABLE IF NOT EXISTS appraisals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- 賃貸査定結果
  calculated_rent_yearly BIGINT, -- 算出賃料（年額）
  calculated_yield DECIMAL(5,2), -- 算出利回り（%）
  market_price BIGINT, -- 算出相場価格
  rental_judgment TEXT, -- 判定（割安、適正、割高）
  
  -- ホテル査定結果
  hotel_rent_yearly BIGINT,
  hotel_yield DECIMAL(5,2),
  hotel_market_price BIGINT,
  hotel_judgment TEXT,
  
  -- オフィス査定結果
  office_rent_yearly BIGINT,
  office_yield DECIMAL(5,2),
  office_market_price BIGINT,
  office_judgment TEXT,
  
  -- 地価査定結果
  land_price_per_sqm DECIMAL(10,2), -- 地価単価（平方メートル）
  calculated_land_price BIGINT, -- 算出地価
  land_judgment TEXT, -- 地価判定
  
  -- 査定実行情報
  appraisal_type TEXT NOT NULL, -- 'rental', 'hotel', 'office', 'land'
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 投資家テーブル
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 基本情報
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  
  -- 投資条件
  min_yield DECIMAL(5,2), -- 最低利回り
  max_price BIGINT, -- 最高価格
  preferred_areas TEXT[], -- 希望エリア（配列）
  preferred_property_types TEXT[], -- 希望物件種別
  
  -- その他条件
  max_building_age INTEGER, -- 最大築年数
  min_building_area DECIMAL(10,2), -- 最小建物面積
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 相場データテーブル（市場データ）
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 地域情報
  prefecture TEXT, -- 都道府県
  city TEXT, -- 市区町村
  station_name TEXT, -- 駅名
  walk_time_range TEXT, -- 徒歩時間範囲（例：0-5分）
  
  -- 相場情報
  average_rent_per_sqm DECIMAL(10,2), -- 平米あたり平均賃料
  average_yield DECIMAL(5,2), -- 平均利回り
  rent_decrease_rate DECIMAL(5,4), -- 賃料下落率
  rentable_ratio DECIMAL(5,4), -- レンタブル面積比率
  
  -- 物件種別・用途
  property_type TEXT, -- 物件種別
  usage_type TEXT, -- 用途（賃貸、ホテル、オフィス）
  
  -- 築年数情報
  building_age_range TEXT, -- 築年数範囲
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 処理ログテーブル
CREATE TABLE IF NOT EXISTS processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ログ情報
  category TEXT NOT NULL, -- ログカテゴリ
  message TEXT NOT NULL, -- ログメッセージ
  level TEXT NOT NULL DEFAULT 'INFO', -- ログレベル（DEBUG, INFO, SUCCESS, ERROR）
  
  -- 関連データ
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- インデックス作成
-- ==========================================

-- 物件検索用インデックス
CREATE INDEX IF NOT EXISTS idx_properties_data_source ON properties(data_source);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_yield_rate ON properties(yield_rate);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_station_name ON properties(station_name);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

-- 位置情報検索用インデックス
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);

-- 査定結果検索用インデックス
CREATE INDEX IF NOT EXISTS idx_appraisals_property_id ON appraisals(property_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_type ON appraisals(appraisal_type);
CREATE INDEX IF NOT EXISTS idx_appraisals_created_at ON appraisals(created_at);

-- 投資家検索用インデックス
CREATE INDEX IF NOT EXISTS idx_investors_min_yield ON investors(min_yield);
CREATE INDEX IF NOT EXISTS idx_investors_max_price ON investors(max_price);

-- ==========================================
-- RLS (Row Level Security) 設定
-- ==========================================

-- 認証されたユーザーのみアクセス可能
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_logs ENABLE ROW LEVEL SECURITY;

-- 全ての認証されたユーザーに読み書き権限を付与
CREATE POLICY "Enable all operations for authenticated users" ON properties
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON appraisals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON investors
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON market_data
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" ON processing_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
