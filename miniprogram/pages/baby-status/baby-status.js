// baby-status.js
Page({
  data: {
    /* ---- Tabs ---- */
    currentTab: 'today',
    historyList: [],

    /* ---- 你的原有数据 ---- */
    symptomRecords: [],
    hasSymptomRecords: false,
    latestSymptom: null,
    latestSymptomDisplay: null,
    
    // 新增：症状列表显示相关
    symptomListText: '暂无描述',
    symptomListFull: '',
    recordTime: '', // 新增记录时间


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

  /* ==========================
     Tab 切换
  ========================== */
  switchTab: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    });
  },

  /* ==========================
     页面加载 / 显示
  ========================== */
  onLoad: function() {
    this.loadAllData();
    this.loadHistory();
  },

  onShow: function() {
    console.log('🔄 我宝情况页面显示，强制刷新所有数据');
    
    // 暴力刷新：每次都重新加载
    this.loadSymptoms();
    this.loadOtherData();
    this.loadHistory();
  },

  /* ==========================
     加载"今天"的所有数据
  ========================== */
  loadAllData: function() {
    this.loadSymptoms();
    this.loadOtherData();
  },

  /* 加载情况记录（今天）- 修正版本 */
loadSymptoms: function() {
  try {
    // 强制清除缓存，确保获取最新数据
    const records = wx.getStorageSync('symptomRecords') || [];
    
    console.log('🔍 存储中的记录数量:', records.length);
    console.log('📋 所有记录详情:', JSON.stringify(records, null, 2));

    // 检查数据一致性
    if (records.length > 0) {
      records.forEach((record, index) => {
        console.log(`📝 记录 ${index}:`, {
          id: record.id,
          timestamp: record.timestamp,
          symptoms: record.symptoms ? record.symptoms.map(s => s.symptomName) : '无症状数组',
          symptomCount: record.symptomCount
        });
      });
    }

    this.setData({
      symptomRecords: records,
      hasSymptomRecords: records.length > 0
    });

    if (records.length > 0) {
      // 获取最新记录（按时间倒序）
      const sortedRecords = records.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp.replace('上午', ' ').replace('下午', ' ')) : new Date(a.id || 0);
        const timeB = b.timestamp ? new Date(b.timestamp.replace('上午', ' ').replace('下午', ' ')) : new Date(b.id || 0);
        return timeB - timeA;
      });
    
      console.log('🕒 排序后的记录时间顺序:', sortedRecords.map(r => ({
        timestamp: r.timestamp,
        id: r.id,
        symptoms: r.symptoms ? r.symptoms.map(s => s.symptomName) : '无'
      })));
      
      const latest = sortedRecords[0];
      
      console.log('⭐ 识别为最新的记录ID:', latest.id);
      console.log('📝 最新记录的症状数组:', latest.symptoms);

      // 生成症状列表文本
      let symptomListFull = '';
      let symptomListText = '';
      let recordTime = '';

      if (latest.symptoms && latest.symptoms.length > 0) {
        // 新数据结构：有 symptoms 数组
        const symptomStrings = latest.symptoms.map(symptom => {
          console.log('🔍 处理症状:', symptom.symptomName, symptom.severity);
          return `${symptom.symptomName}·${symptom.severity}`;
        });
        
        symptomListFull = symptomStrings.join('，');
        symptomListText = symptomListFull;
      } else {
        // 其他情况
        symptomListText = '无有效症状数据';
      }

      // 格式化记录时间
      if (latest.timestamp) {
        try {
          // 修复时间解析
          let date;
          if (latest.timestamp.includes('/')) {
            // 处理 "2025/11/18上午11:56:56" 格式
            const timestampStr = latest.timestamp.replace('上午', ' ').replace('下午', ' ');
            date = new Date(timestampStr);
          } else {
            date = new Date(latest.timestamp);
          }
          if (!isNaN(date.getTime())) {
            recordTime = `记录时间：${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          } else {
            recordTime = '记录时间：时间格式错误';
          }
        } catch (timeErr) {
          console.error('时间解析错误:', timeErr);
          recordTime = '记录时间：解析失败';
        }
      } else {
        recordTime = '记录时间：未知';
      }

      console.log('🎯 最终显示的症状文本:', symptomListText);
      console.log('⏰ 记录时间:', recordTime);

      this.setData({
        latestSymptom: latest,
        symptomListText: symptomListText,
        symptomListFull: symptomListFull,
        recordTime: recordTime
      });

    } else {
      // 无记录情况
      console.log('❌ 没有找到任何记录');
      this.setData({
        latestSymptom: null,
        symptomListText: '暂无描述',
        symptomListFull: '',
        recordTime: ''
      });
    }

  } catch (err) {
    console.error('加载情况出错:', err);
    this.setData({
      symptomListText: '加载失败',
      symptomListFull: '',
      recordTime: ''
    });
  }
},

  /* 加载其他数据 */
  loadOtherData: function() {
    try {
      const saved = wx.getStorageSync('babyHealthData');
      if (saved) {
        this.setData({
          exerciseData: saved.exerciseData || this.data.exerciseData,
          sleepData: saved.sleepData || this.data.sleepData,
          supplementData: saved.supplementData || this.data.supplementData,
          specialData: saved.specialData || this.data.specialData,
          lastUpdate: saved.lastUpdate || '暂无记录'
        });
      }
    } catch (err) {
      console.error('加载其他数据出错:', err);
    }
  },

  /* ==========================
     历史记录计算
  ========================== */
  loadHistory: function() {
    const records = wx.getStorageSync('symptomRecords') || [];

    // 日期分组
    const map = {};
    records.forEach(r => {
      const d = r.date || '未知日期';
      if (!map[d]) map[d] = [];
      map[d].push(r);
    });

    const historyList = Object.keys(map).map(date => {
      const list = map[date];
      return {
        date,
        count: list.length,
        healthIndex: this.calculateDailyScore(list)
      };
    });

    this.setData({ historyList });
  },

  /* 计算一天评分 */
  calculateDailyScore: function(list) {
    let impact = 0;
    list.forEach(s => {
      const severity = s.severity || s.level || 1;
      const freq = Number(s.frequency) || 1;
      impact += severity * freq;
    });
    return Math.max(0, 100 - impact);
  },

  /* ==========================
     工具方法（整合两个版本）
  ========================== */
  getSymptomLabel: function(record) {
    if (!record) return '情况';

    // 1）如果已经存了中文名字
    if (record.label) return record.label;
    if (record.symptomLabel) return record.symptomLabel;
    if (record.symptomName) return record.symptomName;
    if (record.symptomText) return record.symptomText;

    // 2）否则根据 type 映射
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

  getSeverityText: function(level) {
    const val = Number(level);
    if (val === 1) return '轻微';
    if (val === 2) return '中等';
    if (val === 3) return '频繁';
    return '未评估';
  },

  /* ==========================
     页面操作
  ========================== */

  forceRefreshAll: function() {
    console.log('🔄 手动强制刷新所有数据');
    this.loadSymptoms();
    this.loadOtherData();
    this.loadHistory();
    wx.showToast({
      title: '已刷新',
      icon: 'success'
    });
  },

  forceRefreshSymptoms: function() {
    this.loadSymptoms();
    wx.showToast({ title: '刷新完成', icon: 'success' });
  },

  viewSymptomHistory: function() {
    wx.navigateTo({
      url: '/pages/symptom-history/symptom-history'
    });
  },

  editSymptom: function() {
    wx.navigateTo({ url: '/pages/edit-symptom/edit-symptom' });
  },

  editExercise: function() {
    wx.navigateTo({ url: '/pages/edit-exercise/edit-exercise' });
  },

  editSleep: function() {
    wx.navigateTo({ url: '/pages/edit-sleep/edit-sleep' });
  },

  editSupplement: function() {
    wx.navigateTo({ url: '/pages/edit-supplement/edit-supplement' });
  },

  editSpecial: function() {
    wx.navigateTo({ url: '/pages/edit-special/edit-special' });
  },

  saveAllData: function() {
    const allData = {
      exerciseData: this.data.exerciseData,
      sleepData: this.data.sleepData,
      supplementData: this.data.supplementData,
      specialData: this.data.specialData,
      lastUpdate: new Date().toLocaleString('zh-CN')
    };

    wx.setStorageSync('babyHealthData', allData);

    wx.showToast({ title: '保存成功', icon: 'success' });

    this.setData({ lastUpdate: allData.lastUpdate });
  },
  // 临时调试方法：清除所有症状数据
  clearAllSymptoms: function() {
    wx.removeStorageSync('symptomRecords');
    wx.showToast({
      title: '已清除所有数据',
      icon: 'success'
    });
    this.loadSymptoms();
  }
});