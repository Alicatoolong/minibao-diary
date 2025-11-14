// 饮食记录智能分析工具
const FoodAnalyzer = {
  // 常见食物关键词库
  commonFoods: [
    '牛奶', '鸡蛋', '米饭', '面条', '面包', '馒头', '粥',
    '鸡肉', '牛肉', '猪肉', '鱼肉', '虾', '豆腐',
    '西兰花', '胡萝卜', '西红柿', '菠菜', '白菜', '黄瓜',
    '苹果', '香蕉', '橙子', '梨', '葡萄', '草莓',
    '酸奶', '奶酪', '饼干', '蛋糕', '糖果'
  ],

  // 从文本中提取食物
  extractFoodsFromText: function(text) {
    const foods = [];
    this.commonFoods.forEach(food => {
      if (text.includes(food)) {
        foods.push(food);
      }
    });
    return foods;
  },

  // 分析饮食记录
  analyzeDietRecords: function(records) {
    const foodCount = {};
    const recentFoods = {};
    
    // 统计食物出现次数
    records.forEach(record => {
      const foods = this.extractFoodsFromText(record.content);
      foods.forEach(food => {
        foodCount[food] = (foodCount[food] || 0) + 1;
      });
    });

    // 转换为排序数组
    const ranking = Object.keys(foodCount)
      .map(food => ({
        name: food,
        count: foodCount[food],
        percentage: (foodCount[food] / records.length * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 取前10个

    return {
      totalRecords: records.length,
      uniqueFoodsCount: Object.keys(foodCount).length,
      foodRanking: ranking,
      analysisDays: this.calculateAnalysisDays(records)
    };
  },

  // 计算分析天数
  calculateAnalysisDays: function(records) {
    if (records.length === 0) return 0;
    const dates = records.map(r => r.date).filter(Boolean);
    const uniqueDates = [...new Set(dates)];
    return uniqueDates.length;
  }
};

module.exports = FoodAnalyzer;