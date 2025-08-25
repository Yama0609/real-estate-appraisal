/**
 * 査定ロジックライブラリ
 * GASのSateiLogicからNext.js/TypeScriptに移植
 */

export interface RentCalculationResult {
  rentableArea: number;
  adjustedRentMonthly: number;
  adjustedRentYearly: number;
}

export interface PropertyJudgment {
  isUndervalued: boolean;
  judgment: string;
  priceDiff: number;
  priceDiffRate: number;
}

export interface AppraisalResult {
  calculatedRentYearly: number;
  calculatedYield: number;
  marketPrice: number;
  judgment: PropertyJudgment;
}

/**
 * 査定ロジッククラス
 */
export class AppraisalLogic {
  /**
   * 物件の調整後賃料を計算する
   */
  static calculateAdjustedRent(
    buildingArea: number,
    rentableRatio: number,
    averageRentPerSqm: number,
    rentDecreaseRate: number
  ): RentCalculationResult {
    // レンタブル面積の計算
    const rentableArea = buildingArea * rentableRatio;

    // 調整後賃料（月額）の計算
    const adjustedRentMonthly = rentableArea * averageRentPerSqm * (1 - rentDecreaseRate);

    // 調整後賃料（年額）の計算
    const adjustedRentYearly = adjustedRentMonthly * 12;

    return {
      rentableArea,
      adjustedRentMonthly,
      adjustedRentYearly,
    };
  }

  /**
   * 相場価格を計算する
   */
  static calculateMarketPrice(adjustedRentYearly: number, marketYield: number): number {
    // 相場価格 = 調整後賃料（年額）÷ 利回り
    return Math.round(adjustedRentYearly / (marketYield / 100));
  }

  /**
   * 算出利回りを計算する
   */
  static calculateYield(adjustedRentYearly: number, price: number): number {
    if (price === 0) return 0;
    // 算出利回り = 調整後賃料（年額）÷ 物件価格 × 100
    return Number(((adjustedRentYearly / price) * 100).toFixed(2));
  }

  /**
   * 物件が割安か割高かを判定する
   */
  static judgeProperty(price: number, marketPrice: number): PropertyJudgment {
    if (!price || !marketPrice) {
      return {
        isUndervalued: false,
        judgment: "判定不能",
        priceDiff: 0,
        priceDiffRate: 0,
      };
    }

    const priceDiff = marketPrice - price;
    const priceDiffRate = Number(((priceDiff / marketPrice) * 100).toFixed(2));

    if (price < marketPrice * 0.9) {
      return {
        isUndervalued: true,
        judgment: "割安",
        priceDiff,
        priceDiffRate,
      };
    } else if (price > marketPrice * 1.1) {
      return {
        isUndervalued: false,
        judgment: "割高",
        priceDiff,
        priceDiffRate,
      };
    } else {
      return {
        isUndervalued: false,
        judgment: "適正",
        priceDiff,
        priceDiffRate,
      };
    }
  }

  /**
   * 徒歩分数を正規化する
   */
  static normalizeWalkTime(walkTime: unknown): number {
    if (typeof walkTime === 'number') {
      return walkTime;
    }
    
    if (typeof walkTime === 'string') {
      // 数字のみを抽出
      const match = walkTime.match(/\d+/);
      return match ? parseInt(match[0]) : 10; // デフォルト10分
    }
    
    return 10; // デフォルト10分
  }

  /**
   * 駅・エリア別の平均賃料を取得（簡易版）
   */
  static getAverageRentPerSqm(stationName: string, propertyType: string): number {
    // 実際のアプリケーションでは、データベースから取得
    // ここでは簡易的な値を返す
    const rentMap: Record<string, Record<string, number>> = {
      '渋谷': { 'マンション': 4500, 'アパート': 3800, 'オフィス': 5200, 'ホテル': 6000 },
      '新宿': { 'マンション': 4200, 'アパート': 3500, 'オフィス': 4800, 'ホテル': 5500 },
      '池袋': { 'マンション': 3800, 'アパート': 3200, 'オフィス': 4200, 'ホテル': 4800 },
      '大阪': { 'マンション': 3200, 'アパート': 2800, 'オフィス': 3800, 'ホテル': 4200 },
      '栄': { 'マンション': 2800, 'アパート': 2400, 'オフィス': 3400, 'ホテル': 3800 },
    };

    return rentMap[stationName]?.[propertyType] || 3000; // デフォルト3000円/㎡
  }

  /**
   * レンタブル面積比率を取得
   */
  static getRentableRatio(propertyType: string): number {
    const ratioMap: Record<string, number> = {
      'マンション': 0.85,
      'アパート': 0.80,
      'オフィス': 0.75,
      'ホテル': 0.70,
    };

    return ratioMap[propertyType] || 0.80; // デフォルト80%
  }

  /**
   * 賃料下落率を取得
   */
  static getRentDecreaseRate(buildingAge: number): number {
    if (buildingAge <= 5) return 0.05;   // 5年以下: 5%
    if (buildingAge <= 10) return 0.10;  // 10年以下: 10%
    if (buildingAge <= 20) return 0.15;  // 20年以下: 15%
    return 0.20; // 20年超: 20%
  }

  /**
   * 市場利回りを取得
   */
  static getMarketYield(propertyType: string, stationName: string): number {
    const yieldMap: Record<string, Record<string, number>> = {
      '渋谷': { 'マンション': 4.2, 'アパート': 4.8, 'オフィス': 3.8, 'ホテル': 5.5 },
      '新宿': { 'マンション': 4.5, 'アパート': 5.0, 'オフィス': 4.0, 'ホテル': 5.8 },
      '池袋': { 'マンション': 5.0, 'アパート': 5.5, 'オフィス': 4.5, 'ホテル': 6.2 },
      '大阪': { 'マンション': 5.5, 'アパート': 6.0, 'オフィス': 5.0, 'ホテル': 6.5 },
      '栄': { 'マンション': 6.0, 'アパート': 6.5, 'オフィス': 5.5, 'ホテル': 7.0 },
    };

    return yieldMap[stationName]?.[propertyType] || 5.5; // デフォルト5.5%
  }

  /**
   * 総合査定を実行
   */
  static performAppraisal(property: {
    building_area: number;
    station_name: string;
    property_type: string;
    building_age: number;
    price: number;
  }): AppraisalResult {
    // 各種パラメータを取得
    const averageRentPerSqm = this.getAverageRentPerSqm(property.station_name, property.property_type);
    const rentableRatio = this.getRentableRatio(property.property_type);
    const rentDecreaseRate = this.getRentDecreaseRate(property.building_age);
    const marketYield = this.getMarketYield(property.property_type, property.station_name);

    // 調整後賃料を計算
    const rentResult = this.calculateAdjustedRent(
      property.building_area,
      rentableRatio,
      averageRentPerSqm,
      rentDecreaseRate
    );

    // 相場価格を計算
    const marketPrice = this.calculateMarketPrice(rentResult.adjustedRentYearly, marketYield);

    // 算出利回りを計算
    const calculatedYield = this.calculateYield(rentResult.adjustedRentYearly, property.price);

    // 判定を実行
    const judgment = this.judgeProperty(property.price, marketPrice);

    return {
      calculatedRentYearly: Math.round(rentResult.adjustedRentYearly),
      calculatedYield,
      marketPrice,
      judgment,
    };
  }
}
