// 健康趋势计算函数（你原有的重要逻辑，完全保留）
const HEALTH_CALCULATION = {
  // 症状权重映射
  SYMPTOM_WEIGHTS: {
    'blink': 1.0, 'nose': 1.0, 'eyebrow': 1.0, 'mouth': 1.0, 'head': 1.0, 'shoulder': 1.0,
    'neck': 1.5, 'belly': 1.5, 'wrist': 1.5, 'ankle': 1.5, 'jump': 1.5, 'touch': 1.5,
    'throat': 2.0, 'cough': 2.0, 'sniff': 2.0, 'animal': 2.0, 'squeal': 2.0,
    'repeat': 2.5, 'echo': 2.5, 'nonsense': 2.5,
    'coprolalia': 3.0, 'insult': 3.0,
    'compulsion': 1.5, 'other': 1.0,
    'asymptomatic': 0
  },

  // 严重程度系数
  SEVERITY_FACTORS: { 1: 1.0, 2: 1.5, 3: 2.0 },

  // 计算频率影响因子
  calculateFrequencyFactor: function(frequency) {
    if (!frequency) return 1.0;
    const freq = parseInt(frequency) || 0;
    if (freq <= 10) return 1.0;
    if (freq <= 30) return 1.2;
    if (freq <= 50) return 1.5;
    if (freq <= 100) return 1.8;
    return 2.0;
  },

  // 计算单日健康指数
  calculateDailyHealthIndex: function(symptoms) {
    if (!symptoms || symptoms.length === 0) return 100;

    let totalImpact = 0;
    let symptomCount = 0;

    symptoms.forEach(symptom => {
      if (symptom.type === 'asymptomatic') return;
      
      const weight = this.SYMPTOM_WEIGHTS[symptom.type] || 1.0;
      const severityFactor = this.SEVERITY_FACTORS[symptom.level] || 1.0;
      const frequencyFactor = this.calculateFrequencyFactor(symptom.frequency);
      
      const impact = weight * severityFactor * frequencyFactor;
      totalImpact += impact;
      symptomCount++;
    });

    // 如果有症状，计算健康指数
    if (symptomCount > 0) {
      const avgImpact = totalImpact / symptomCount;
      const healthIndex = Math.max(0, 100 - (avgImpact * 8));
      return Math.round(healthIndex);
    }

    return 100;
  },

  // 生成最近5天的健康趋势数据
  generateHealthTrendData: function(symptoms) {
    const trendData = [];
    const today = new Date();
    
    // 生成最近5天的日期
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
      const fullDateString = date.toISOString().split('T')[0];
      
      // 获取当天的症状记录
      const dailySymptoms = symptoms.filter(symptom => {
        if (!symptom.date) return false;
        const symptomDate = new Date(symptom.date);
        return symptomDate.toDateString() === date.toDateString();
      });
      
      const healthIndex = this.calculateDailyHealthIndex(dailySymptoms);
      
      trendData.push({
        date: fullDateString,
        displayDate: dateString,
        healthIndex: healthIndex,
        symptomCount: dailySymptoms.length,
        hasSymptoms: dailySymptoms.length > 0
      });
    }
    
    return trendData;
  }
};

// 数据存储工具（新增的持久化功能）
const StorageManager = {
  // 保存所有记录数据
  saveAllRecords(records) {
    try {
      wx.setStorageSync('symptomRecords', records);
      console.log('数据保存成功', records);
      return true;
    } catch (e) {
      console.error('数据保存失败:', e);
      return false;
    }
  },

  // 读取所有记录数据
  getAllRecords() {
    try {
      return wx.getStorageSync('symptomRecords') || [];
    } catch (e) {
      console.error('数据读取失败:', e);
      return [];
    }
  },

  // 保存宝宝信息
  saveBabyInfo(babyInfo) {
    try {
      wx.setStorageSync('babyBasicInfo', babyInfo);
      console.log('宝宝信息保存成功', babyInfo);
      return true;
    } catch (e) {
      console.error('宝宝信息保存失败:', e);
      return false;
    }
  },

  // 读取宝宝信息
  getBabyInfo() {
    try {
      return wx.getStorageSync('babyBasicInfo') || {};
    } catch (e) {
      console.error('宝宝信息读取失败:', e);
      return {};
    }
  }
};

Page({
  data: {
    symptomRecords: [],
    hasSymptomRecords: false,
    latestSymptom: null,
    babyInfo: {
      name: '',
      age: '',
      healthStatus: '',
      healthRating: 0,
      birthday: ''
    },
    hotPosts: [
      {
        id: 1,
        author: '张妈妈',
        title: '宝宝花粉过敏怎么办？',
        content: '分享我的抗过敏经验，希望对大家有帮助...',
        likes: 23
      },
      {
        id: 2, 
        author: '李爸爸',
        title: '湿疹宝宝的护理心得',
        content: '三个月战胜湿疹！分享我的护理方法...',
        likes: 45
      },
      {
        id: 3,
        author: '王妈妈', 
        title: '过敏体质饮食调理',
        content: '这些食物要避开，这些可以多吃...',
        likes: 67
      }
    ],
    healthTrendData: [],
    currentHealthIndex: 88,
    healthChartVisible: true,
  },

  onLoad: function(options) {
    console.log('🚀 首页开始加载');
    
    // 使用StorageManager加载宝宝信息
    const savedBabyInfo = StorageManager.getBabyInfo();
    console.log('📥 加载的宝宝信息:', savedBabyInfo);
    if (savedBabyInfo && savedBabyInfo.name) {
      this.setData({
        babyInfo: {
          ...this.data.babyInfo,
          ...savedBabyInfo
        }
      });
    }
    
    // 检查症状记录
    const symptoms = StorageManager.getAllRecords();
    console.log('📋 症状记录数量:', symptoms.length);
    console.log('📋 症状记录内容:', symptoms);
    
    // 计算并设置年龄
    this.calculateAge();
    this.calculateHealthTrend();
  },

  onShow: function() {
    // 每次页面显示时重新计算年龄和健康趋势
    this.calculateAge();
    this.calculateHealthTrend();
  },

  // 计算健康趋势
  calculateHealthTrend: function() {
    try {
      const symptoms = StorageManager.getAllRecords();
      console.log('📊 开始计算健康趋势，症状记录数:', symptoms.length);
      
      // 如果没有症状记录，使用默认数据
      if (symptoms.length === 0) {
        console.log('📝 没有症状记录，使用默认数据');
        const defaultData = this.generateDefaultTrendData();
        this.setData({
          healthTrendData: defaultData,
          currentHealthIndex: defaultData[defaultData.length - 1].healthIndex
        });
        return;
      }
      
      const trendData = HEALTH_CALCULATION.generateHealthTrendData(symptoms);
      console.log('📈 生成的趋势数据:', trendData);
      
      // 计算当前健康指数（今天的数据）
      const todayHealth = trendData.length > 0 ? trendData[trendData.length - 1].healthIndex : 100;
      
      this.setData({
        healthTrendData: trendData,
        currentHealthIndex: todayHealth
      });
      
    } catch (error) {
      console.error('💥 计算健康趋势时出错:', error);
      // 出错时使用默认数据
      const defaultData = this.generateDefaultTrendData();
      this.setData({
        healthTrendData: defaultData,
        currentHealthIndex: 88
      });
    }
  },

  // 生成默认趋势数据
  generateDefaultTrendData: function() {
    const today = new Date();
    const trendData = [];
    
    // 生成最近5天的默认数据
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
      
      // 生成随机但合理的健康指数（85-95之间）
      const healthIndex = 85 + Math.floor(Math.random() * 11);
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        displayDate: dateString,
        healthIndex: healthIndex,
        symptomCount: 0,
        hasSymptoms: false
      });
    }
    
    return trendData;
  },

  // 计算年龄方法
  calculateAge: function() {
    const birthday = this.data.babyInfo.birthday;
    if (!birthday) {
      console.log('没有生日数据');
      return;
    }
    
    const birthDate = new Date(birthday);
    const today = new Date();
    
    // 验证日期是否有效
    if (isNaN(birthDate.getTime())) {
      console.error('无效的生日日期:', birthday);
      return;
    }
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    // 如果当前月份小于出生月份，年份减1，月份加12
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // 如果当前日期小于出生日期，月份减1
    if (today.getDate() < birthDate.getDate()) {
      months--;
      // 如果月份变成负数，年份减1，月份加12
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    // 确保月份在合理范围内
    if (months < 0) months = 0;
    if (months > 11) months = 11;
    
    // 构建年龄显示字符串
    let ageString = '';
    if (years > 0) {
      ageString += `${years}岁`;
    }
    if (months > 0) {
      if (ageString) ageString += '';
      ageString += `${months}个月`;
    }
    if (!ageString) {
      ageString = '新生儿';
    }
    
    // 更新数据
    this.setData({
      'babyInfo.age': ageString
    });
  },

  // 获取健康等级标签
  getHealthLabel: function(healthIndex) {
    if (healthIndex >= 90) return '优秀';
    if (healthIndex >= 80) return '良好';
    if (healthIndex >= 70) return '一般';
    if (healthIndex >= 60) return '关注';
    return '需重视';
  },

  // 获取健康等级颜色
  getHealthColor: function(healthIndex) {
    if (healthIndex >= 90) return '#4CAF50';
    if (healthIndex >= 80) return '#8BC34A';
    if (healthIndex >= 70) return '#FFC107';
    if (healthIndex >= 60) return '#FF9800';
    return '#F44336';
  },

  // 刷新健康数据
  refreshHealthData: function() {
    this.calculateHealthTrend();
    wx.showToast({
      title: '数据已更新',
      icon: 'success'
    });
  },

  // 数据点点击事件
  onDataPointTap: function(e) {
    const item = e.currentTarget.dataset.item;
    const index = e.currentTarget.dataset.index;
    console.log('点击数据点:', item, index);
    
    // 显示详细数据
    wx.showModal({
      title: `${item.displayDate} 健康详情`,
      content: `健康评分: ${item.healthIndex}分\n症状记录: ${item.symptomCount}条`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 显示健康详情
  showHealthDetail: function(e) {
    const { date, score } = e.currentTarget.dataset;
    wx.showModal({
      title: `${date} 健康详情`,
      content: `健康评分: ${score}`,
      showCancel: false
    });
  },

  // 快速记录点击事件
  quickRecord: function(e) {
    const type = e.currentTarget.dataset.type;
    console.log('快速记录类型:', type);
    
    // 这里可以弹出对应的记录模态框
    wx.showModal({
      title: '记录' + this.getTypeName(type),
      content: '记录' + this.getTypeName(type) + '信息',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '记录成功',
            icon: 'success'
          });
        }
      }
    });
  },

  getTypeName: function(type) {
    const names = {
      'mood': '情绪',
      'diet': '饮食', 
      'sleep': '睡眠',
      'exercise': '运动',
      'special': '特殊情况'
    };
    return names[type] || type;
  },

  // 编辑宝宝信息
  editBabyInfo: function() {
    console.log('点击编辑宝宝信息');
    
    // 构建要传递的数据
    const babyInfo = {
      name: this.data.babyInfo.name,
      birthday: this.data.babyInfo.birthday,
      status: this.data.babyInfo.healthStatus,
      rating: this.data.babyInfo.healthRating
    };
    
    wx.navigateTo({
      url: `/pages/edit-baby-info/edit-baby-info?babyInfo=${encodeURIComponent(JSON.stringify(babyInfo))}`,
      success: function(res) {
        console.log('跳转到编辑页面成功');
      },
      fail: function(err) {
        console.error('跳转到编辑页面失败:', err);
        wx.showToast({
          title: '无法打开编辑页面',
          icon: 'none'
        });
      }
    });
  },

  // 更新宝宝信息（供编辑页面回调）
  updateBabyInfo: function(newData) {
    // 保存到存储
    StorageManager.saveBabyInfo(newData);
    // 更新页面数据
    this.setData({
      babyInfo: {
        ...this.data.babyInfo,
        ...newData
      }
    });
    // 重新计算年龄
    this.calculateAge();
  },

  navToBabyStatus: function() {
    console.log('跳转到我宝情况页面');
    wx.redirectTo({
      url: '/pages/baby-status/baby-status',
      success: function(res) {
        console.log('跳转成功', res);
      },
      fail: function(err) {
        console.error('跳转失败', err);
        wx.reLaunch({
          url: '/pages/baby-status/baby-status'
        });
      }
    });
  },

  // 跳转到心情日记页面  
  navToDiary: function() {
    console.log('跳转到心情日记页面');
    wx.redirectTo({
      url: '/pages/diary-list/diary-list',
      success: function(res) {
        console.log('跳转成功', res);
      },
      fail: function(err) {
        console.error('跳转失败', err);
        wx.reLaunch({
          url: '/pages/diary-list/diary-list'
        });
      }
    });
  },

  // 跳转到看看周围页面
  navToMap: function() {
    console.log('跳转到看看周围页面');
    wx.redirectTo({
      url: '/pages/map/map',
      success: function(res) {
        console.log('跳转成功', res);
      },
      fail: function(err) {
        console.error('跳转失败', err);
        wx.reLaunch({
          url: '/pages/map/map'
        });
      }
    });
  },

  // 开始聊天功能
  startChat: function() {
    console.log('开始聊天');
    wx.redirectTo({
      url: '/pages/chat/chat',
      success: function(res) {
        console.log('跳转成功', res);
      },
      fail: function(err) {
        console.error('跳转失败', err);
        wx.reLaunch({
          url: '/pages/chat/chat'
        });
      }
    });
  },

  // 签到功能
  handleCheckin: function() {
    wx.showToast({
      title: '签到成功！',
      icon: 'success'
    });
  },

  // 分享功能
  handleShare: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 获取评分星星
  getRatingStars: function(rating) {
    const stars = ['☆', '☆', '☆', '☆', '☆'];
    for (let i = 0; i < rating; i++) {
      stars[i] = '★';
    }
    return stars.join('');
  }
});