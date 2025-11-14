Page({
  data: {
    symptomRecords: [],
    hasSymptomRecords: false,
    latestSymptom: null,
    latestSymptomDisplay: null,
    
    dietData: {
      breakfast: '牛奶200ml + 鸡蛋1个',
      lunch: '米饭 + 青菜 + 鱼肉',
      dinner: '面条 + 胡萝卜',
      snack: '苹果泥',
      water: '800ml'
    },
    exerciseData: {
      duration: '2小时',
      activities: '户外散步、室内游戏',
      intensity: '适中'
    },
    sleepData: {
      totalHours: '10',
      nightAwakenings: '2',
      quality: '良好',
      naptime: '2小时'
    },
    supplementData: {
      list: [
        { name: '维生素D', dose: '400IU', time: '早晨' },
        { name: 'DHA', dose: '100mg', time: '午餐后' }
      ]
    },
    specialData: {
      notes: '今天接触了宠物，需观察过敏反应',
      medications: ''
    },
    lastUpdate: '暂无记录'
  },

  onLoad: function(options) {
    console.log('🚀 宝宝状态页面加载');
    this.loadAllData();
  },

  onShow: function() {
    console.log('🔄 宝宝状态页面显示');
    this.loadAllData();
  },

  // 加载所有数据
  loadAllData: function() {
    this.loadSymptoms();
    this.loadOtherData();
  },

  // 专门加载情况数据
  loadSymptoms: function() {
    try {
      const records = wx.getStorageSync('symptomRecords') || [];
      console.log('📥 加载到的情况记录:', records);
      console.log('🔢 记录数量:', records.length);
      
      this.setData({
        symptomRecords: records,
        hasSymptomRecords: records.length > 0
      });
      
      // 设置最新情况 + 展示用数据
      if (records.length > 0) {
        const sortedRecords = records.sort((a, b) => b.id - a.id);
        const latest = sortedRecords[0] || {};

        // 1. 类型文字
        const typeText = this.getSymptomLabel(latest);

        // 2. 严重程度文字（level 可能是数字或者字符串）
        const levelText = this.getSeverityText(latest.level);

        // 3. 频率：你在 edit-symptom 里是怎么存就怎么读，这里当字符串来用
        const frequencyText = latest.frequency
          ? String(latest.frequency)
          : (latest.frequencyText || '频率未记录');

        // 4. 描述（可能为空）
        const description = latest.description || latest.desc || '';

        this.setData({
          latestSymptom: latest,
          latestSymptomDisplay: {
            typeText,
            levelText,
            frequencyText,
            description
          }
        });
        console.log('⭐ 最新情况:', latest);
        console.log('📝 最新情况展示数据:', this.data.latestSymptomDisplay);
      } else {
        this.setData({
          latestSymptom: null,
          latestSymptomDisplay: null
        });
        console.log('❌ 没有情况记录');
      }
      
    } catch (error) {
      console.error('💥 加载情况数据时出错:', error);
    }
  },

  // 加载其他数据
  loadOtherData: function() {
    try {
      const savedData = wx.getStorageSync('babyHealthData');
      if (savedData) {
        this.setData({
          dietData: savedData.dietData || this.data.dietData,
          exerciseData: savedData.exerciseData || this.data.exerciseData,
          sleepData: savedData.sleepData || this.data.sleepData,
          supplementData: savedData.supplementData || this.data.supplementData,
          specialData: savedData.specialData || this.data.specialData,
          lastUpdate: savedData.lastUpdate || '暂无记录'
        });
      }
    } catch (error) {
      console.error('💥 加载其他数据时出错:', error);
    }
  },
// 把记录里的“类型字段”转换成给妈妈看的文字
getSymptomLabel: function(record) {
  if (!record) return '情况';

  // 1）如果记录里本身就存了中文名称，优先用它
  if (record.label) return record.label;
  if (record.symptomLabel) return record.symptomLabel;
  if (record.symptomName) return record.symptomName;
  if (record.symptomText) return record.symptomText;

  // 2）否则根据 type / symptomType 做一个兜底映射
  const type = record.type || record.symptomType || '';
  const map = {
    head: '摇头',
    blink: '眨眼',
    nose: '皱鼻子',
    mouth: '做表情 / 咧嘴',
    shoulder: '耸肩',
    neck: '扭脖子',
    jump: '身体抽动',
    cough: '清嗓 / 咳嗽',
    throat: '喉部发声',
    repeat: '重复说话',
    echo: '学别人说话',
    asymptomatic: '目前无明显情况',
    other: '其他情况'
  };

  return map[type] || '情况';
},

// 把 level 数字转换成“轻度 / 中度 / 重度”
getSeverityText: function(level) {
  const val = Number(level);
  if (val === 1) return '轻度';
  if (val === 2) return '中度';
  if (val === 3) return '重度';
  return '未评估';
},
  // 强制刷新情况数据
  forceRefreshSymptoms: function() {
    console.log('🔄 强制刷新情况数据');
    this.loadSymptoms();
    wx.showToast({
      title: '刷新完成',
      icon: 'success'
    });
  },

  // 查看情况历史记录
  viewSymptomHistory: function() {
    console.log('📚 点击查看历史记录');
    wx.navigateTo({
      url: '/pages/symptom-history/symptom-history',
      success: function(res) {
        console.log('✅ 跳转到历史记录成功');
      },
      fail: function(err) {
        console.error('❌ 跳转到历史记录失败:', err);
      }
    });
  },

  // 编辑情况
  editSymptom: function() {
    console.log('✏️ 点击编辑情况');
    
    wx.navigateTo({
      url: '/pages/edit-symptom/edit-symptom',
      success: function(res) {
        console.log('✅ 跳转到编辑页面成功');
      },
      fail: function(err) {
        console.error('❌ 跳转到编辑页面失败:', err);
        console.log('错误详情:', err);
        
        wx.showToast({
          title: '无法打开编辑页面',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 其他编辑方法
  editDiet: function() {
    console.log('🍽️ 点击编辑饮食');
    wx.navigateTo({
      url: '/pages/edit-diet/edit-diet'
    });
  },

  editExercise: function() {
    console.log('🏃 点击编辑运动');
    wx.navigateTo({
      url: '/pages/edit-exercise/edit-exercise'
    });
  },

  editSleep: function() {
    console.log('😴 点击编辑睡眠');
    wx.navigateTo({
      url: '/pages/edit-sleep/edit-sleep'
    });
  },

  editSupplement: function() {
    console.log('💊 点击编辑补给');
    wx.navigateTo({
      url: '/pages/edit-supplement/edit-supplement'
    });
  },

  editSpecial: function() {
    console.log('🆘 点击编辑特殊');
    wx.navigateTo({
      url: '/pages/edit-special/edit-special'
    });
  },

  // 保存所有数据
  saveAllData: function() {
    const allData = {
      dietData: this.data.dietData,
      exerciseData: this.data.exerciseData,
      sleepData: this.data.sleepData,
      supplementData: this.data.supplementData,
      specialData: this.data.specialData,
      lastUpdate: new Date().toLocaleString('zh-CN')
    };

    try {
      wx.setStorageSync('babyHealthData', allData);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({
        lastUpdate: allData.lastUpdate
      });
    } catch (e) {
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
})