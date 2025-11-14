Page({
  data: {
    hasData: false,
    totalRecords: 0,
    usedRecords: 0,
    latestDate: '',
    commonFoods: [],      // [{ name, count, isAllergen }]
    newFoods: [],         // [{ name, isAllergen }]
    decreasedFoods: []    // [{ name, isAllergen }]
  },

  onLoad() {
    this.loadAndAnalyze();
  },

  onShow() {
    // 回到页面时刷新一下，防止记录有更新
    this.loadAndAnalyze();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 读取本地存储并进行分析
  loadAndAnalyze() {
    try {
      const records = wx.getStorageSync('dietRecords') || [];

      if (!records.length) {
        this.setData({
          hasData: false,
          totalRecords: 0,
          usedRecords: 0,
          commonFoods: [],
          newFoods: [],
          decreasedFoods: []
        });
        return;
      }

      // 按时间从近到远排序（之前保存用的是时间戳 id）
      records.sort((a, b) => (b.id || 0) - (a.id || 0));

      const usedRecords = records.slice(0, 30);
      const analysis = this.analyzeRecords(usedRecords);

      this.setData({
        hasData: true,
        totalRecords: records.length,
        usedRecords: usedRecords.length,
        latestDate: usedRecords[0].date || '',
        commonFoods: analysis.commonFoods,
        newFoods: analysis.newFoods,
        decreasedFoods: analysis.decreasedFoods
      });
    } catch (e) {
      console.error('读取饮食记录失败：', e);
      wx.showToast({
        title: '读取数据失败',
        icon: 'none'
      });
      this.setData({
        hasData: false
      });
    }
  },

  // 分析所有记录：频次 & 新增/减少
  analyzeRecords(records) {
    // 将最近记录一分为二：前半段 = 最近；后半段 = 较早
    const half = Math.ceil(records.length / 2);
    const recentPart = records.slice(0, half);      // 最近的
    const earlyPart = records.slice(half);          // 较早的

    const totalMap = this.buildFoodMap(records);
    const recentMap = this.buildFoodMap(recentPart);
    const earlyMap = this.buildFoodMap(earlyPart);

    // 最近常吃食物（按总频次排序）
    const commonFoods = Object.keys(totalMap)
      .map(name => ({
        name,
        count: totalMap[name],
        isAllergen: this.isAllergen(name)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 只展示前 10 个

    // 新增：最近有、以前没有
    const newFoods = Object.keys(recentMap)
      .filter(name => !earlyMap[name])
      .map(name => ({
        name,
        isAllergen: this.isAllergen(name)
      }))
      .slice(0, 5);

    // 减少：以前有、最近没有
    const decreasedFoods = Object.keys(earlyMap)
      .filter(name => !recentMap[name])
      .map(name => ({
        name,
        isAllergen: this.isAllergen(name)
      }))
      .slice(0, 5);

    return {
      commonFoods,
      newFoods,
      decreasedFoods
    };
  },

  // 构建 { 食物名: 出现次数 } 映射
  buildFoodMap(records) {
    const map = {};

    (records || []).forEach(record => {
      const content = record.content || '';
      const foods = this.splitFoods(content);

      foods.forEach(name => {
        if (!name) return;
        map[name] = (map[name] || 0) + 1;
      });
    });

    return map;
  },

  // 将一条饮食文本拆成若干「食物名称」
  // 示例："喝了200ml牛奶，一个鸡蛋，半片面包"
  // => ["喝了200ml牛奶", "一个鸡蛋", "半片面包"] （简单拆分）
  splitFoods(content) {
    if (!content) return [];

    let text = String(content);

    // 统一各种分隔符为逗号
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, ',')
      .replace(/，/g, ',')
      .replace(/、/g, ',')
      .replace(/；/g, ',')
      .replace(/;/g, ',');

    const parts = text.split(',');
    const foods = [];

    parts.forEach(raw => {
      const item = raw.trim();
      if (!item) return;

      // 过滤掉太长的描述（比如整句话），只保留长度适中的词
      if (item.length > 0 && item.length <= 15) {
        foods.push(item);
      }
    });

    return foods;
  },

  // 判断某个食物名是否为「较常见易致敏食物」
  // 参考八大致敏源：牛奶、鸡蛋、小麦、花生、坚果、大豆、鱼类、甲壳类
  isAllergen(foodName) {
    if (!foodName) return false;
    const name = String(foodName);

    const allergenKeywords = [
      // 牛奶类
      '牛奶', '奶粉', '乳制品', '酸奶', '奶酪', '芝士', '奶油',
      // 鸡蛋类
      '鸡蛋', '蛋黄', '蛋白', '鸡蛋饼', '蛋糕',
      // 小麦 / 面制品
      '小麦', '面包', '面条', '面粉', '馒头', '饼干', '麦片',
      // 花生 & 坚果
      '花生', '花生酱', '坚果', '核桃', '腰果', '杏仁', '榛子', '开心果',
      // 大豆
      '大豆', '黄豆', '豆浆', '豆奶', '豆腐', '豆制品',
      // 鱼类 & 甲壳类
      '鱼', '鱼肉', '三文鱼', '鳕鱼',
      '虾', '对虾', '虾仁', '蟹', '蟹肉', '螃蟹', '贝类',
      // 糖类（有些宝宝对高糖食品也需要特别留意）
      '糖', '糖果', '巧克力', '甜饮料'
    ];

    return allergenKeywords.some(key => name.indexOf(key) !== -1);
  }
});
