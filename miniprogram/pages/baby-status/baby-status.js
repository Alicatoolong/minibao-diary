// baby-status.js - 优化版本
// 在文件开头添加 StorageManager
const StorageManager = {
  // 保存身高体重记录
  saveHeightWeightRecord(record) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingRecords = wx.getStorageSync('heightWeightRecords') || {};
      
      existingRecords[today] = {
        ...record,
        date: today,
        timestamp: new Date().toISOString()
      };
      
      wx.setStorageSync('heightWeightRecords', existingRecords);
      return true;
    } catch (e) {
      console.error('保存身高体重记录失败:', e);
      return false;
    }
  },
  // 获取所有身高体重记录
  getAllHeightWeightRecords() {
    try {
      return wx.getStorageSync('heightWeightRecords') || {};
    } catch (e) {
      return {};
    }
  }
};
  
// 引入性能优化工具
const PerformanceUtils = {
  // 简化缓存管理
  cache: new Map(),
  
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  setCache(key, data, ttl = 300000) {
    this.cache.set(key, {
      data,
      expire: Date.now() + ttl
    });
  },
  
  getCache(key) {
    const item = this.cache.get(key);
    if (item && item.expire > Date.now()) {
      return item.data;
    }
    if (item) {
      this.cache.delete(key);
    }
    return null;
  },

  clearCacheByPattern(pattern) {
    for (let key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  },

  // 数据压缩
  compressSymptomData(records) {
    return records.map(record => ({
      i: record.id,
      t: record.timestamp,
      d: record.date,
      s: record.symptoms ? record.symptoms.map(s => ({
        n: s.symptomName,
        l: s.severity
      })) : []
    }));
  },

  // 数据解压
  decompressSymptomData(compressedRecords) {
    return compressedRecords.map(record => ({
      id: record.i,
      timestamp: record.t,
      date: record.d,
      symptoms: record.s.map(symptom => ({
        symptomName: symptom.n,
        severity: symptom.l
      }))
    }));
  },

  clearExpiredCache() {
    const now = Date.now();
    for (let [key, item] of this.cache) {
      if (item.expire <= now) {
        this.cache.delete(key);
      }
    }
  }
};

// 缓存策略配置
const CACHE_CONFIG = {
  BABY_INFO: 300000,
  SYMPTOMS: 60000,
  HISTORY: 120000,
  OTHER_DATA: 300000
};

Page({
  data: {
    /* ---- Tabs ---- */
    currentTab: 'today',
    historyList: [],

    /* ---- 优化后的数据 ---- */
    symptomRecords: [],
    hasSymptomRecords: false,
    latestSymptom: null,
    latestSymptomDisplay: null,
    
    // 新增：加载状态
    loadingStates: {
      symptoms: false,
      history: false,
      babyInfo: false
    },

    // 状况列表显示相关
    symptomListText: '暂无描述',
    symptomListFull: '',
    recordTime: '',

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

    lastUpdate: '暂无记录',
  /* ---- 新增：身高体重数据 ---- */
  height: '',
  weight: '',
  heightWeightHistory: [],
  showHeightWeightModal: false,
  todayHeight: null,
  todayWeight: null
},
  // 编辑身高体重 - 跳转到二级界面
  editHeightWeight() {
    wx.navigateTo({ 
      url: '/pages/edit-height-weight/edit-height-weight' 
    });
  },

// 查看身高体重历史记录
viewHeightWeightHistory() {
  wx.navigateTo({ 
    url: '/pages/height-weight-history/height-weight-history' 
  });
},

// 清除今日身高体重记录
clearHeightWeight() {
  wx.showModal({
    title: '确认清除',
    content: '确定要清除今日的身高体重记录吗？',
    success: (res) => {
      if (res.confirm) {
        const today = new Date().toISOString().split('T')[0];
        const records = StorageManager.getAllHeightWeightRecords();
        
        if (records[today]) {
          delete records[today];
          wx.setStorageSync('heightWeightRecords', records);
          
          // 清除缓存
          PerformanceUtils.cache.delete('height_weight_cache');
          
          // 重新加载数据
          this.loadHeightWeightHistory();
          
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '今日无记录',
            icon: 'none'
          });
        }
      }
    }
  });
},

  /* ==========================
     性能优化方法
  ========================== */
  
  // 设置加载状态
  setLoading(key, state) {
    this.setData({
      [`loadingStates.${key}`]: state
    });
  },

  // 错误处理
  handleDataLoadError(type, error) {
    console.error(`加载${type}失败:`, error);
    wx.showToast({
      title: `${type}加载失败`,
      icon: 'none'
    });
  },

  /* ==========================
     页面生命周期
  ========================== */
  onLoad: function() {
    this.setupPerformanceMonitoring();
    this.loadAllData();
    this.loadHeightWeightHistory(); // 新增
  },
  
  onShow: function() {
    console.log('🔄 我宝状况页面显示，智能刷新数据');
    this.forceRefreshAll();
    this.loadHeightWeightHistory(); // 新增
  },

  onUnload: function() {
    // 清理缓存
    PerformanceUtils.clearExpiredCache();
  },

  /* ==========================
     性能监控设置
  ========================== */
  // 修改缓存清理策略
  setupPerformanceMonitoring() {
    this.loadTimes = {
      symptoms: 0,
      history: 0,
      babyInfo: 0
    };
    // 移除定时清理
  },  // <-- 这里添加逗号，确保语法正确

  /* ==========================
     智能数据加载
  ========================== */
  loadAllData: function() {
    // 并行加载，提高效率
    Promise.all([
      this.loadBabyInfo(),
      this.loadSymptoms(),
      this.loadOtherData(),
      this.loadHistory()
    ]).catch(error => {
      this.handleDataLoadError('页面数据', error);
      this.handleDataLoadError('页面数据', error);
    });
  },
  // 加载身高体重历史
  loadHeightWeightHistory() {
    return new Promise((resolve) => {
      try {
        const cacheKey = 'height_weight_cache';
        const cached = PerformanceUtils.getCache(cacheKey);
        
        if (cached) {
          console.log('📏 使用缓存的身高体重记录');
          this.setData({
            heightWeightHistory: cached.history,
            todayHeight: cached.todayHeight,
            todayWeight: cached.todayWeight
          });
          resolve(cached);
          return;
        }

        const records = StorageManager.getAllHeightWeightRecords();
        const recordArray = Object.values(records)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5); // 只显示最近5条
        
        let todayHeight = null;
        let todayWeight = null;
        
        if (recordArray.length > 0) {
          todayHeight = recordArray[0].height;
          todayWeight = recordArray[0].weight;
        }

        const result = {
          history: recordArray,
          todayHeight: todayHeight,
          todayWeight: todayWeight
        };

        this.setData({
          heightWeightHistory: recordArray,
          todayHeight: todayHeight,
          todayWeight: todayWeight
        });

        // 缓存数据
        PerformanceUtils.setCache(cacheKey, result, 300000); // 5分钟缓存
        resolve(result);
      } catch (error) {
        console.error('加载身高体重历史失败:', error);
        this.setData({
          heightWeightHistory: [],
          todayHeight: null,
          todayWeight: null
        });
        resolve({ history: [], todayHeight: null, todayWeight: null });
      }
    });
  },
  // ... 其余代码保持不变 ...

  /* ==========================
     优化：宝宝信息加载
  ========================== */
  loadBabyInfo: function() {
    return new Promise((resolve) => {
      this.setLoading('babyInfo', true);
      const startTime = Date.now();
      
      try {
        const cacheKey = 'baby_info_cache';
        const cached = PerformanceUtils.getCache(cacheKey);
        
        if (cached) {
          console.log('👶 使用缓存的宝宝信息');
          this.setData({
            babyInfo: cached
          });
          this.loadTimes.babyInfo = Date.now() - startTime;
          this.setLoading('babyInfo', false);
          resolve(cached);
          return;
        }

        const babyInfo = wx.getStorageSync('babyInfo') || {};
        const processedInfo = {
          name: babyInfo.name || '宝宝',
          age: babyInfo.age || '0岁0个月'
        };
        
        console.log('👶 加载宝宝信息:', processedInfo);
        
        this.setData({
          babyInfo: processedInfo
        });

        // 缓存宝宝信息
        PerformanceUtils.setCache(cacheKey, processedInfo, CACHE_CONFIG.BABY_INFO);
        this.loadTimes.babyInfo = Date.now() - startTime;
        resolve(processedInfo);
      } catch (err) {
        this.handleDataLoadError('宝宝信息', err);
        resolve({ name: '宝宝', age: '0岁0个月' });
      } finally {
        this.setLoading('babyInfo', false);
      }
    });
  },

  /* ==========================
     优化：状况记录加载（核心优化）
  ========================== */
  loadSymptoms: function() {
    return new Promise((resolve) => {
      this.setLoading('symptoms', true);
      const startTime = Date.now();
      
      try {
        const cacheKey = 'symptoms_cache';
        const cached = PerformanceUtils.getCache(cacheKey);
        
        if (cached) {
          console.log('📋 使用缓存的状况记录');
          this.processSymptomsData(cached);
          this.loadTimes.symptoms = Date.now() - startTime;
          this.setLoading('symptoms', false);
          resolve(cached);
          return;
        }

        // 强制清除缓存，确保获取最新数据
        const records = wx.getStorageSync('symptomRecords') || [];
        
        console.log('🔍 存储中的记录数量:', records.length);

        // 数据压缩存储检查
        let processedRecords = records;
        if (records.length > 0 && records[0].i) {
          processedRecords = PerformanceUtils.decompressSymptomData(records);
        }

        this.processSymptomsData(processedRecords);

        // 缓存处理后的数据
        PerformanceUtils.setCache(cacheKey, processedRecords, CACHE_CONFIG.SYMPTOMS);
        this.loadTimes.symptoms = Date.now() - startTime;
        resolve(processedRecords);
      } catch (err) {
        this.handleDataLoadError('状况记录', err);
        resolve([]);
      } finally {
        this.setLoading('symptoms', false);
      }
    });
  },

  /* ==========================
     状况数据处理（分离逻辑）
  ========================== */
  processSymptomsData: function(records) {
    this.setData({
      symptomRecords: records,
      hasSymptomRecords: records.length > 0
    });

    if (records.length > 0) {
      // 获取最新记录（优化排序算法）
      const latest = this.getLatestRecord(records);
      this.displayLatestSymptom(latest);
    } else {
      this.setNoSymptomsState();
    }
  },

  /* ==========================
     优化：获取最新记录
  ========================== */
  getLatestRecord: function(records) {
    // 使用更高效的排序方法
    return records.reduce((latest, current) => {
      const currentTime = this.parseRecordTime(current);
      const latestTime = this.parseRecordTime(latest);
      return currentTime > latestTime ? current : latest;
    }, records[0]);
  },

  /* ==========================
     优化：时间解析
  ========================== */
  parseRecordTime: function(record) {
    if (!record.timestamp) return new Date(record.id || 0);
    
    try {
      // 统一时间格式处理
      const timestampStr = record.timestamp.replace(/上午|下午/g, ' ');
      return new Date(timestampStr);
    } catch (e) {
      return new Date(record.id || 0);
    }
  },

  /* ==========================
     显示最新状况
  ========================== */
  displayLatestSymptom: function(latest) {
    console.log('⭐ 识别为最新的记录ID:', latest.id);

    let symptomListFull = '';
    let symptomListText = '';
    let recordTime = '';

    if (latest.symptoms && latest.symptoms.length > 0) {
      // 使用更高效的字符串拼接
      symptomListFull = latest.symptoms.map(symptom => 
        `${symptom.symptomName}·${symptom.severity}`
      ).join('，');
      
      symptomListText = symptomListFull;
    } else {
      symptomListText = '无有效状况数据';
    }

    // 格式化记录时间
    recordTime = this.formatRecordTime(latest);

    console.log('🎯 最终显示的状况文本:', symptomListText);
    console.log('⏰ 记录时间:', recordTime);

    this.setData({
      latestSymptom: latest,
      symptomListText: symptomListText,
      symptomListFull: symptomListFull,
      recordTime: recordTime
    });
  },

  /* ==========================
     优化：时间格式化
  ========================== */
  formatRecordTime: function(record) {
    if (!record.timestamp) return '记录时间：未知';
    
    try {
      const date = this.parseRecordTime(record);
      if (!isNaN(date.getTime())) {
        return `记录时间：${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch (timeErr) {
      console.error('时间解析错误:', timeErr);
    }
    return '记录时间：解析失败';
  },

  /* ==========================
     无记录状态
  ========================== */
  setNoSymptomsState: function() {
    console.log('❌ 没有找到任何记录');
    this.setData({
      latestSymptom: null,
      symptomListText: '暂无描述',
      symptomListFull: '',
      recordTime: ''
    });
  },

  /* ==========================
     优化：保存状况记录
  ========================== */
  saveSymptomRecord: PerformanceUtils.debounce(function(record) {
    try {
      const records = wx.getStorageSync('symptomRecords') || [];
      
      const newRecord = {
        id: Date.now(), // 使用时间戳作为ID
        timestamp: new Date().toLocaleString('zh-CN'),
        date: new Date().toISOString().split('T')[0],
        ...record
      };
      
      records.push(newRecord);
      
      // 使用压缩存储
      const compressedRecords = PerformanceUtils.compressSymptomData(records);
      wx.setStorageSync('symptomRecords', compressedRecords);
      
      console.log('✅ 保存成功，当前记录数:', records.length);
      
      // 清除相关缓存，确保数据一致性
      PerformanceUtils.cache.delete('symptoms_cache');
      PerformanceUtils.cache.delete('history_cache');
      
      // 立即更新页面显示
      this.loadSymptoms();
      this.loadHistory();
      
      wx.showToast({
        title: '记录保存成功',
        icon: 'success'
      });
      
      return true;
    } catch (err) {
      console.error('❌ 保存记录失败:', err);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
      return false;
    }
  }, 500), // 500ms防抖

  /* ==========================
     快速记录状况（防抖优化）
  ========================== */
  quickRecordSymptom: PerformanceUtils.debounce(function(e) {
    const symptomType = e.currentTarget.dataset.type;
    const symptomName = e.currentTarget.dataset.name;
    
    const record = {
      symptomType: symptomType,
      symptomName: symptomName,
      severity: 1,
      frequency: '偶尔',
      symptoms: [{
        symptomName: symptomName,
        severity: 1
      }],
      symptomCount: 1
    };
    
    if (this.saveSymptomRecord(record)) {
      console.log('✅ 快速记录成功:', symptomName);
    }
  }, 1000), // 1秒防抖，防止重复点击

  /* ==========================
     优化：其他数据加载
  ========================== */
  loadOtherData: function() {
    return new Promise((resolve) => {
      try {
        const cacheKey = 'other_data_cache';
        const cached = PerformanceUtils.getCache(cacheKey);
        
        if (cached) {
          this.setData(cached);
          resolve(cached);
          return;
        }

        const saved = wx.getStorageSync('babyHealthData');
        if (saved) {
          const otherData = {
            exerciseData: saved.exerciseData || this.data.exerciseData,
            sleepData: saved.sleepData || this.data.sleepData,
            supplementData: saved.supplementData || this.data.supplementData,
            specialData: saved.specialData || this.data.specialData,
            lastUpdate: saved.lastUpdate || '暂无记录'
          };
          
          this.setData(otherData);
          PerformanceUtils.setCache(cacheKey, otherData, CACHE_CONFIG.OTHER_DATA);
          resolve(otherData);
        } else {
          resolve({});
        }
      } catch (err) {
        console.error('加载其他数据出错:', err);
        resolve({});
      }
    });
  },

  /* ==========================
     优化：历史记录计算
  ========================== */
  loadHistory: function() {
    return new Promise((resolve) => {
      this.setLoading('history', true);
      
      try {
        const cacheKey = 'history_cache';
        const cached = PerformanceUtils.getCache(cacheKey);
        
        if (cached) {
          this.setData({ historyList: cached });
          this.setLoading('history', false);
          resolve(cached);
          return;
        }

        const records = wx.getStorageSync('symptomRecords') || [];
        const processedRecords = records.length > 0 && records[0].i ? 
          PerformanceUtils.decompressSymptomData(records) : records;

        // 日期分组（使用Map提高性能）
        const dateMap = new Map();
        processedRecords.forEach(r => {
          const date = r.date || '未知日期';
          if (!dateMap.has(date)) {
            dateMap.set(date, []);
          }
          dateMap.get(date).push(r);
        });

        const historyList = Array.from(dateMap.entries()).map(([date, list]) => ({
          date,
          count: list.length,
          healthIndex: this.calculateDailyScore(list)
        }));

        this.setData({ historyList });
        PerformanceUtils.setCache(cacheKey, historyList, CACHE_CONFIG.HISTORY);
        resolve(historyList);
      } catch (err) {
        this.handleDataLoadError('历史记录', err);
        resolve([]);
      } finally {
        this.setLoading('history', false);
      }
    });
  },

  /* ==========================
     其他方法保持不变（工具方法、页面操作等）
  ========================== */
  
  goBack: function() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.reLaunch({ url: '/pages/index/index' });
    }
  },

  switchTab: function(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    });
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

  getSymptomLabel: function(record) {
    if (!record) return '状况';
    if (record.label) return record.label;
    if (record.symptomLabel) return record.symptomLabel;
    if (record.symptomName) return record.symptomName;
    if (record.symptomText) return record.symptomText;

    const type = record.type || record.symptomType || '';
    const map = {
      head: '摇头', blink: '眨眼', nose: '皱鼻子', mouth: '做表情 / 咧嘴',
      shoulder: '耸肩', neck: '扭脖子', jump: '身体抽动', cough: '清嗓 / 咳嗽',
      throat: '喉部发声', repeat: '重复说话', echo: '学别人说话',
      asymptomatic: '目前无明显状况', other: '其他状况'
    };
    return map[type] || '状况';
  },

  getSeverityText: function(level) {
    const val = Number(level);
    if (val === 1) return '轻微';
    if (val === 2) return '中等';
    if (val === 3) return '频繁';
    return '未评估';
  },

  /* ==========================
     页面操作（防抖优化）
  ========================== */

  forceRefreshAll: function() {
    console.log('🔄 手动强制刷新所有数据');
    // 清除所有缓存
    PerformanceUtils.cache.clear();
    
    Promise.all([
      this.loadSymptoms(),
      this.loadOtherData(),
      this.loadHistory(),
      this.loadHeightWeightHistory() // 新增
    ]).then(() => {
      wx.showToast({ title: '已刷新', icon: 'success' });
    });
  },

  forceRefreshSymptoms: function() {
    PerformanceUtils.cache.delete('symptoms_cache');
    this.loadSymptoms().then(() => {
      wx.showToast({ title: '刷新完成', icon: 'success' });
    });
  },

  // 其他导航方法保持不变
  viewSymptomHistory: function() {
    wx.navigateTo({ url: '/pages/symptom-history/symptom-history' });
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

  saveAllData: PerformanceUtils.debounce(function() {
    const allData = {
      exerciseData: this.data.exerciseData,
      sleepData: this.data.sleepData,
      supplementData: this.data.supplementData,
      specialData: this.data.specialData,
      lastUpdate: new Date().toLocaleString('zh-CN')
    };

    wx.setStorageSync('babyHealthData', allData);
    PerformanceUtils.cache.delete('other_data_cache');

    wx.showToast({ title: '保存成功', icon: 'success' });
    this.setData({ lastUpdate: allData.lastUpdate });
  }, 500),

  // 临时调试方法
  clearAllSymptoms: function() {
    wx.removeStorageSync('symptomRecords');
    PerformanceUtils.cache.clear();
    wx.showToast({ title: '已清除所有数据', icon: 'success' });
    this.loadSymptoms();
  }
}); 