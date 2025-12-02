// 在控制台检查当前存储的宝宝信息
console.log('当前宝宝信息:', wx.getStorageSync('babyInfo'))
console.log('当前用户标识:', wx.getStorageSync('user_openid'))
// ============ 统一备份管理器 ============
const UnifiedBackupManager = {
  /**
   * 全量数据备份
   */
  async backupAllData() {
    try {
      let openid = wx.getStorageSync('user_openid');
      
      if (!openid || openid === 'unknown') {
        console.log('⚠️ 用户未登录或openid异常，尝试使用unknown备份');
        openid = 'unknown';
      }
  
      console.log('📦 开始分类全量数据备份，openid:', openid);
      
      // 🆕 新增：分别备份到不同集合
      await this.backupToSeparateCollections(openid);
      
      // 🆕 保留原有的全量备份（用于版本历史）
      await this.createFullBackupSnapshot(openid);
      
      console.log('✅ 分类备份完成');
      wx.setStorageSync('last_full_backup', new Date().getTime());
      
      return true;
    } catch (error) {
      console.error('❌ 全量备份失败:', error);
      return false;
    }
  },

  /**
 * 🆕 新增：分类备份到不同集合（带调试信息）
 */
async backupToSeparateCollections(openid) {
  const db = wx.cloud.database();
  
  try {
    console.log('🏗️ 开始分类备份到不同集合...');
    console.log('🔐 当前用户标识:', openid);

    // 🆕 详细检查所有本地数据
    console.log('🔍 === 本地数据详细检查 ===');
    const babyInfo = StorageManager.getBabyInfo();
    console.log('👶 宝宝信息:', babyInfo);
    console.log('👶 宝宝姓名是否存在:', babyInfo && babyInfo.name ? '是' : '否');
    
    const symptoms = StorageManager.getAllRecords();
    console.log('🤒 症状记录:', symptoms);
    console.log('🤒 症状记录数量:', symptoms.length);
    
    const growthRecords = wx.getStorageSync('heightWeightRecords') || [];
    console.log('📏 身高体重记录:', growthRecords);
    console.log('📏 身高体重记录数量:', growthRecords.length);
    
    const diaries = wx.getStorageSync('diaryList') || [];
    console.log('📔 心情日记:', diaries);
    console.log('📔 心情日记数量:', diaries.length);
    
    const experiences = wx.getStorageSync('experiencePosts') || [];
    console.log('💬 经验分享:', experiences); // 🆕 修正：添加了括号
    console.log('💬 经验分享数量:', experiences.length);
    console.log('🔍 === 检查结束 ===');

    // 1. 备份宝宝信息到 baby_info 集合
    console.log('\n👶 开始备份宝宝信息...');
    if (babyInfo && babyInfo.name) {
      try {
        console.log('📤 准备保存宝宝信息到 baby_info 集合...');
        const result = await db.collection('baby_info').add({
          data: {
            openid: openid,
            ...babyInfo,
            updateTime: new Date(),
            backupTime: new Date()
          }
        });
        console.log('✅ 宝宝信息已备份到 baby_info 集合，文档ID:', result._id);
      } catch (error) {
        console.error('❌ baby_info 集合备份失败:', error);
        console.log('🔧 错误详情:', {
          错误码: error.errCode,
          错误信息: error.errMsg
        });
      }
    } else {
      console.log('📭 无宝宝信息可备份，原因:', !babyInfo ? 'babyInfo为null' : '没有宝宝姓名');
    }

    // 2. 备份症状记录到 symptoms 集合
    console.log('\n🤒 开始备份症状记录...');
    if (symptoms.length > 0) {
      try {
        console.log('📤 准备保存症状记录到 symptoms 集合...');
        const result = await db.collection('symptoms').add({
          data: {
            openid: openid,
            records: symptoms,
            recordCount: symptoms.length,
            backupTime: new Date()
          }
        });
        console.log('✅ 症状记录已备份到 symptoms 集合，文档ID:', result._id);
      } catch (error) {
        console.error('❌ symptoms 集合备份失败:', error);
        console.log('🔧 错误详情:', {
          错误码: error.errCode,
          错误信息: error.errMsg
        });
      }
    } else {
      console.log('📭 无症状记录可备份');
    }

    // 3. 备份身高体重到 height_weight_records 集合
    console.log('\n📏 开始备份身高体重...');
    if (growthRecords.length > 0) {
      try {
        console.log('📤 准备保存身高体重到 height_weight_records 集合...');
        const result = await db.collection('height_weight_records').add({
          data: {
            openid: openid,
            records: growthRecords,
            recordCount: growthRecords.length,
            backupTime: new Date()
          }
        });
        console.log('✅ 身高体重已备份到 height_weight_records 集合，文档ID:', result._id);
      } catch (error) {
        console.error('❌ height_weight_records 集合备份失败:', error);
        console.log('🔧 错误详情:', {
          错误码: error.errCode,
          错误信息: error.errMsg
        });
      }
    } else {
      console.log('📭 无身高体重记录可备份');
    }

    // 4. 备份心情日记到 diaries 集合
    console.log('\n📔 开始备份心情日记...');
    if (diaries.length > 0) {
      try {
        console.log('📤 准备保存心情日记到 diaries 集合...');
        const result = await db.collection('diaries').add({
          data: {
            openid: openid,
            records: diaries,
            recordCount: diaries.length,
            backupTime: new Date()
          }
        });
        console.log('✅ 心情日记已备份到 diaries 集合，文档ID:', result._id);
      } catch (error) {
        console.error('❌ diaries 集合备份失败:', error);
        console.log('🔧 错误详情:', {
          错误码: error.errCode,
          错误信息: error.errMsg
        });
      }
    } else {
      console.log('📭 无心情日记可备份');
    }

    // 5. 备份经验分享到 experience_posts 集合
    console.log('\n💬 开始备份经验分享...');
    if (experiences.length > 0) {
      try {
        console.log('📤 准备保存经验分享到 experience_posts 集合...');
        const result = await db.collection('experience_posts').add({
          data: {
            openid: openid,
            records: experiences,
            recordCount: experiences.length,
            backupTime: new Date()
          }
        });
        console.log('✅ 经验分享已备份到 experience_posts 集合，文档ID:', result._id);
      } catch (error) {
        console.error('❌ experience_posts 集合备份失败:', error);
        console.log('🔧 错误详情:', {
          错误码: error.errCode,
          错误信息: error.errMsg
        });
      }
    } else {
      console.log('📭 无经验分享可备份');
    }

    console.log('🎉 分类备份尝试完成');

  } catch (error) {
    console.error('❌ 分类备份整体失败:', error);
    // 不抛出错误，让备份流程继续
  }
},

/**
 * 🆕 新增：创建全量备份快照（用于版本历史）
 */
async createFullBackupSnapshot(openid) {
  const db = wx.cloud.database();
  
  try {
    const backupData = {
      // 核心健康数据
      symptoms: StorageManager.getAllRecords(),
      babyInfo: StorageManager.getBabyInfo(),
      emotionRecords: wx.getStorageSync('emotionExerciseRecords') || {},
      heightWeightRecords: wx.getStorageSync('heightWeightRecords') || [],
      
      // 成长记录数据
      diaryList: wx.getStorageSync('diaryList') || [],
      experiencePosts: wx.getStorageSync('experiencePosts') || [],
      checkinData: wx.getStorageSync('babyCheckinData') || {},
      
      // 元数据
      type: 'full_backup',
      backupTime: new Date(),
      dataVersion: '2.0',
      openid: openid,
      dataSummary: this.generateDataSummary()
    };

    // 🆕 使用 records 集合作为备选，确保备份总能成功
    try {
      const result = await db.collection('backups').add({
        data: backupData
      });
      console.log('✅ 全量快照备份完成，ID:', result._id);
    } catch (error) {
      console.log('⚠️ backups 集合不存在，使用 records 集合作为备选');
      // 备选方案：使用原有的 records 集合
      const result = await db.collection('records').add({
        data: {
          ...backupData,
          type: 'full_backup_snapshot' // 修改类型以示区别
        }
      });
      console.log('✅ 全量快照已备份到 records 集合，ID:', result._id);
    }

  } catch (error) {
    console.error('❌ 全量快照备份失败:', error);
    // 不抛出错误，让备份流程继续
  }
},

  /**
   * 生成数据统计
   */
  generateDataSummary() {
    return {
      症状记录数: StorageManager.getAllRecords().length,
      宝宝信息: StorageManager.getBabyInfo().name ? '已设置' : '未设置',
      情绪记录天数: Object.keys(wx.getStorageSync('emotionExerciseRecords') || {}).length,
      身高体重记录数: (wx.getStorageSync('heightWeightRecords') || []).length,
      饮食记录数: (wx.getStorageSync('dietRecords') || []).length,
      日记数量: (wx.getStorageSync('diaryList') || []).length,
      经验分享数: (wx.getStorageSync('experiencePosts') || []).length,
      签到天数: (wx.getStorageSync('babyCheckinData') || {}).days || 0
    };
  }
};

// ============ 健康趋势计算模块 ============
const HEALTH_CALCULATION = {
  SYMPTOM_WEIGHTS: {
    'blink': 1.0, 'nose': 1.0, 'eyebrow': 1.0, 'mouth': 1.0, 'head': 1.0, 'shoulder': 1.0,
    'neck': 1.5, 'belly': 1.5, 'wrist': 1.5, 'ankle': 1.5, 'jump': 1.5, 'touch': 1.5,
    'throat': 2.0, 'cough': 2.0, 'sniff': 2.0, 'animal': 2.0, 'squeal': 2.0,
    'repeat': 2.5, 'echo': 2.5, 'nonsense': 2.5,
    'coprolalia': 3.0, 'insult': 3.0,
    'compulsion': 1.5, 'other': 1.0,
    'asymptomatic': 0
  },

  SEVERITY_FACTORS: { 1: 1.0, 2: 1.5, 3: 2.0 },

  // 添加缓存机制
  _cache: new Map(),
  
  /**
   * 计算每日健康指数
   */
  calculateDailyHealthIndex(symptoms) {
    const cacheKey = `health_index_${JSON.stringify(symptoms)}`;
    
    // 检查缓存
    if (this._cache.has(cacheKey)) {
      return this._cache.get(cacheKey);
    }

    if (!symptoms || symptoms.length === 0) {
      this._cache.set(cacheKey, 100);
      return 100;
    }
  
    let totalImpact = 0;
    let symptomCount = 0;
    const symptomGroups = {};
    
    // 按症状类型分组，避免重复计算同类型症状
    symptoms.forEach(symptom => {
      const symptomType = symptom.type || symptom.symptomType;
      const severityLevel = symptom.level || symptom.severity;

      if (symptomType === 'asymptomatic') return;

      if (!symptomGroups[symptomType]) {
        symptomGroups[symptomType] = {
          type: symptomType,
          maxSeverity: severityLevel
        };
      }
      
      // 记录最严重的程度
      if (severityLevel > symptomGroups[symptomType].maxSeverity) {
        symptomGroups[symptomType].maxSeverity = severityLevel;
      }
    });
  
    // 计算每种症状类型的影响
    Object.values(symptomGroups).forEach(group => {
      const weight = this.SYMPTOM_WEIGHTS[group.type] || 1.0;
      const severityFactor = this.SEVERITY_FACTORS[group.maxSeverity] || 1.0;
      const impact = weight * severityFactor;
      totalImpact += impact;
      symptomCount++;
    });
  
    let result = 100;
    if (symptomCount > 0) {
      const avgImpact = totalImpact / symptomCount;
      result = Math.max(0, Math.round(100 - avgImpact * 8));
    }

    this._cache.set(cacheKey, result);
    
    // 限制缓存大小
    if (this._cache.size > 50) {
      const firstKey = this._cache.keys().next().value;
      this._cache.delete(firstKey);
    }
    
    return result;
  },

  // 清空缓存
  clearCache() {
    this._cache.clear();
  },

  /**
   * 生成健康趋势数据
   */
  generateHealthTrendData(symptoms) {
    const trendData = [];
    const today = new Date();
  
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
  
      // 按日期过滤症状
      const dailySymptoms = symptoms.filter(s => {
        if (!s.recordDate) return false;
        
        let recordDate;
        if (s.recordDate.includes('/')) {
          recordDate = new Date(s.recordDate).toDateString();
        } else {
          recordDate = new Date(s.recordDate).toDateString();
        }
        
        return recordDate === date.toDateString();
      });
  
      trendData.push({
        date: dateString,
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        healthIndex: this.calculateDailyHealthIndex(dailySymptoms),
        symptomCount: dailySymptoms.length,
        hasSymptoms: dailySymptoms.length > 0
      });
    }
  
    return trendData;
  }
};

// ============ 数据存储管理模块 ============
const StorageManager = {
  // 防抖存储，避免频繁写入
  debounceTimer: null,
  
  debounceSet(key, data, delay = 500) {
    clearTimeout(this.debounceTimer);
    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(() => {
        try {
          wx.setStorageSync(key, data);
          resolve(true);
        } catch (e) {
          console.error('存储失败:', e);
          resolve(false);
        }
      }, delay);
    });
  },

  // 批量操作支持
  batchSet(items) {
    try {
      items.forEach(({key, data}) => {
        wx.setStorageSync(key, data);
      });
      return true;
    } catch (e) {
      console.error('批量存储失败:', e);
      return false;
    }
  },

  // 数据压缩（针对症状记录）
  compressSymptomData(records) {
    return records.map(record => ({
      id: record.id,
      d: record.date,
      s: record.symptoms.map(s => ({
        t: s.type || s.symptomType,
        l: s.level || s.severity
      }))
    }));
  },

  // 解压数据
  decompressSymptomData(compressedRecords) {
    return compressedRecords.map(record => ({
      id: record.id,
      date: record.d,
      symptoms: record.s.map(symptom => ({
        type: symptom.t,
        level: symptom.l
      }))
    }));
  },

  // ============ 核心数据存储方法 ============
  
  // 症状记录相关
  saveAllRecords(records) {
    try { 
      return this.debounceSet('symptomRecords', records); 
    } catch (e) { 
      return false; 
    }
  },
  
  getAllRecords() {
    try { 
      const records = wx.getStorageSync('symptomRecords') || [];
      if (records.length > 0 && records[0].d) {
        return this.decompressSymptomData(records);
      }
      return records;
    } catch (e) { 
      return []; 
    }
  },
  
  // 宝宝信息相关
  saveBabyInfo(info) {
    try { 
      wx.setStorageSync('babyBasicInfo', info); 
      return true; 
    } catch (e) { 
      return false; 
    }
  },
  
  getBabyInfo() {
    try { 
      return wx.getStorageSync('babyBasicInfo') || {}; 
    } catch (e) { 
      return {}; 
    }
  },
  
  // 情绪运动记录相关
  saveEmotionExerciseRecord(record) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingRecords = wx.getStorageSync('emotionExerciseRecords') || {};
      
      existingRecords[today] = {
        ...record,
        date: today,
        timestamp: new Date().toISOString()
      };
      
      wx.setStorageSync('emotionExerciseRecords', existingRecords);
      return true;
    } catch (e) {
      console.error('保存情绪运动记录失败:', e);
      return false;
    }
  },

  getTodayEmotionExercise() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = wx.getStorageSync('emotionExerciseRecords') || {};
      return records[today] || null;
    } catch (e) {
      return null;
    }
  }
};

// ============ 页面主要逻辑 ============
Page({
  // ============ 页面数据定义 ============
  data: {
    // 宝宝基本信息
    babyInfo: {
      name: '',
      age: '',
      birthday: '',
      healthStatus: '',
      lastUpdateTime: 0,
      healthRating: 0
    },
    
    // 🔐 协议相关数据
    showAgreementModal: false,
    hasAgreed: false,
    agreementChecked: false,
    hasAgreedInProtocolPage: false, // 🆕 新增：标记是否在协议页面点击过同意
    // 💬 留言功能相关数据
    showChatModal: false,
    messageContent: '',
    messages: [],
    
    // 📊 加载状态管理
    loadingStates: {
      healthTrend: false,
      hotPosts: false,
      babyInfo: false
    },
    
    // 🏃‍♂️ 快速记录相关数据
    lastClickTime: 0,  
    showQuickRecordModal: false,
    quickRecordType: '', // 'emotion' 或 'exercise' 或 'sleep' 或 'screentime'
    selectedEmotion: 1, // 1:开心 2:平静 3:不开心
    selectedExercise: '30-60',
    selectedSleep: 2, // 1:低于8小时 2:8-10小时 3:10小时以上
    selectedScreenTime: 60,
    todayEmotion: null,
    todayExercise: null,
    todaySleep: null,
    todayScreenTime: null,
    
    // 📈 健康趋势数据
    healthTrendData: [],
    currentHealthIndex: 100,
    trendLines: [],
    chartLineHeight: 0,
    yAxisLabels: [],
    
    // 📅 签到功能相关数据
    checkinDays: 0,
    showToast: false,
    isChecked: false,
    
    // 🔥 热门帖子数据
    hotPosts: []
  },

  // ============ 页面生命周期 ============
onLoad() {
  console.log('🚀 首页开始加载');
  
  // 🆕 检查登录和宝宝信息状态
  console.log('🔍 当前状态检查:', {
    user_agreed: wx.getStorageSync('user_agreed'),
    user_openid: wx.getStorageSync('user_openid'),
    babyInfo: StorageManager.getBabyInfo(),
    hasBabyInfo: Object.keys(StorageManager.getBabyInfo()).length > 0
  });
  
  // 如果宝宝信息为空，提示用户去设置
  const babyInfo = StorageManager.getBabyInfo();
  if (!babyInfo || Object.keys(babyInfo).length === 0) {
    console.log('👶 宝宝信息为空，提示用户设置');
    // 可以在这里添加提示，但不强制跳转
  }
  // 首先检查协议状态
  const hasAgreed = wx.getStorageSync('user_agreed');
  console.log('📋 存储的协议状态:', hasAgreed);

  // 检查协议状态
  this.checkAgreementStatus();

  // 然后初始化其他数据
  this.initBabyInfo();
  this.calculateAge();
  this.calculateHealthTrend();
  this.initCheckinData();
  this.loadTodayEmotionExercise(); 
  this.loadHotPosts();
 // this.getMessagesFromCloud(); // 暂时注释，先让页面正常加载
  
  // 数据备份和恢复检查
  this.checkAndRestoreData();
  
  // 安全检查
  this.cleanupOldData();
  
  // 设置错误处理
  this.setupErrorHandling();

},

  onShow() {
    console.log('🔄 首页显示，刷新数据');
    this.forceRefreshData();
    
    // 🆕 自动触发备份（每天第一次进入首页时）
    this.autoBackupCheck();
  },
  
  // ============ 🆕 新增备份相关方法 ============
  
  /**
   * 自动备份检查
   */
  autoBackupCheck() {
    try {
      const today = new Date().toDateString();
      const lastBackupDate = wx.getStorageSync('last_backup_date');
      
      console.log('🔍 备份检查:', {
        今天: today,
        上次备份日期: lastBackupDate,
        是否需要备份: lastBackupDate !== today
      });
      
      // 🆕 优化：先检查登录状态
      if (!this.checkAndFixLoginStatus()) {
        console.log('⏳ 登录状态异常，等待登录完成');
        return;
      }
      
      // 🆕 优化：检查是否有新数据
      if (lastBackupDate !== today && this.hasNewData()) {
        console.log('📅 今天首次进入且有新数据，触发分类备份');
        this.executeFullBackup();
        wx.setStorageSync('last_backup_date', today);
      } else {
        console.log('⏰ 今天已备份过或无新数据，跳过');
      }
    } catch (error) {
      console.error('❌ 自动备份检查失败:', error);
    }
  },
  
  /**
   * 🆕 新增：检查是否有新数据
   */
  hasNewData() {
    const lastBackupTime = wx.getStorageSync('last_full_backup') || 0;
    const dataUpdateTimes = [
      wx.getStorageSync('symptomRecords_update') || 0,
      wx.getStorageSync('babyInfo_update') || 0,
      wx.getStorageSync('heightWeightRecords_update') || 0
    ];
    
    const latestUpdate = Math.max(...dataUpdateTimes);
    return latestUpdate > lastBackupTime;
  },
/**
   * 🆕 检查并修复登录状态（正确的位置）
   */
  checkAndFixLoginStatus() {
    const openid = wx.getStorageSync('user_openid');
    console.log('🔐 当前登录状态:', { openid, 类型: typeof openid });
    
    if (!openid || openid === '' || openid === 'unknown') {
      console.log('🔄 检测到登录状态异常，尝试重新登录');
      this.doWechatLogin();
      return false;
    }
    return true;
  },
 


  onUnload() {
    // 清理工作
    HEALTH_CALCULATION.clearCache();
  },

  // ============ 协议授权相关方法 ============

/**
 * 检查协议状态
 */
checkAgreementStatus() {
  try {
    const hasAgreed = wx.getStorageSync('user_agreed');
    console.log('🎯 协议状态检查结果:', hasAgreed);
    console.log('🎯 数据类型:', typeof hasAgreed);
    
    // 🆕 修复：正确检查协议状态
    if (hasAgreed !== true && hasAgreed !== 'true') {
      console.log('👤 用户未同意协议，显示协议弹窗');
      
      // 延迟显示，确保页面加载完成
      setTimeout(() => {
        this.setData({
          showAgreementModal: true,
          hasAgreed: false,
          agreementChecked: false
        });
        console.log('🎯 弹窗状态已设置为显示');
      }, 800);
    } else {
      console.log('✅ 用户已同意协议，不显示弹窗');
      this.setData({
        hasAgreed: true,
        showAgreementModal: false
      });
      // 已同意协议，执行登录
      this.doWechatLogin();
    }
  } catch (error) {
    console.error('❌ 检查协议状态出错:', error);
    // 出错时默认显示协议弹窗
    setTimeout(() => {
      this.setData({
        showAgreementModal: true,
        hasAgreed: false,
        agreementChecked: false
      });
    }, 800);
  }
},

  onAgreementChange(e) {
    const agreed = e.detail.value.length > 0;
    this.setData({ agreementChecked: agreed });
    
    if (agreed) {
      wx.showToast({
        title: '勾选即代表同意协议',
        icon: 'none',
        duration: 1500
      });
    }
  },

/**
 * 同意协议并登录
 */
onAgreeAndLogin() {
  if (!this.data.agreementChecked) {
    wx.showToast({ title: '请先勾选同意用户协议', icon: 'none' });
    return;
  }

  console.log('用户同意协议，开始登录');
  
  // 保存同意状态
  wx.setStorageSync('user_agreed', true);
  wx.setStorageSync('agreement_time', new Date().getTime());
  
  // 关闭协议弹窗
  this.setData({
    showAgreementModal: false,
    hasAgreed: true
  });
  
  // 执行微信登录
  this.doWechatLogin();
  
  wx.showToast({ title: '欢迎使用敏宝日记', icon: 'success', duration: 1500 });
},  

 /**
 * 🆕 新增：执行全量备份
 */
executeFullBackup() {
  const lastBackup = wx.getStorageSync('last_full_backup');
  const now = new Date().getTime();
  
  // 如果1小时内备份过，跳过
  if (lastBackup && (now - lastBackup) < 60 * 60 * 1000) {
    console.log('⏰ 1小时内已备份过，跳过');
    return Promise.resolve();
  }
  
  wx.showLoading({ title: '全量备份中...' });
  
  console.log('🚀 开始执行全量备份...');
  
  // 🆕 先检查本地数据
  const localData = {
    symptoms: StorageManager.getAllRecords(),
    babyInfo: StorageManager.getBabyInfo(),
    emotionRecords: wx.getStorageSync('emotionExerciseRecords'),
    diaryList: wx.getStorageSync('diaryList'),
    experiencePosts: wx.getStorageSync('experiencePosts'),
    checkinData: wx.getStorageSync('babyCheckinData')
  };
  
  console.log('🔍 本地数据检查:', {
    症状记录数: localData.symptoms.length,
    宝宝信息: localData.babyInfo.name ? '已设置' : '未设置',
    情绪记录: Object.keys(localData.emotionRecords || {}).length,
    日记数量: (localData.diaryList || []).length,
    经验帖子: (localData.experiencePosts || []).length
  });
  
  // 🆕 执行全量备份
  return UnifiedBackupManager.backupAllData().then(success => {
    if (success) {
      console.log('✅ 全量备份执行成功');
      wx.setStorageSync('last_full_backup', now);
    } else {
      console.warn('⚠️ 全量备份执行失败');
      // 🆕 备份失败时尝试症状备份作为备选
      return this.autoBackupSymptomRecords().then(() => {
        console.log('✅ 症状备份成功');
      }).catch(backupError => {
        console.error('❌ 症状备份也失败了:', backupError);
      });
    }
  }).catch(error => {
    console.error('❌ 全量备份异常:', error);
    // 🆕 异常时也尝试症状备份
    return this.autoBackupSymptomRecords().then(() => {
      console.log('✅ 症状备份成功');
    }).catch(backupError => {
      console.error('❌ 症状备份也失败了:', backupError);
    });
  }).finally(() => {
    wx.hideLoading();
  });
},

 /**
 * 🆕 自动备份症状记录
 */
autoBackupSymptomRecords() {
  return new Promise((resolve, reject) => {
    try {
      const openid = wx.getStorageSync('user_openid') || 'unknown';
      const db = wx.cloud.database();
      const records = StorageManager.getAllRecords();
      
      if (records.length > 0) {
        db.collection('records').add({
          data: {
            openid: openid,
            type: 'symptom_backup',
            symptoms: records,
            recordCount: records.length,
            backupTime: new Date(),
            dataVersion: '2.0'
          }
        }).then(() => {
          console.log('✅ 症状记录备份完成，记录数:', records.length);
          resolve(true);
        }).catch(error => {
          console.error('❌ 症状记录备份失败:', error);
          reject(error);
        });
      } else {
        console.log('📭 无症状记录可备份');
        resolve(false);
      }
    } catch (error) {
      console.error('❌ 症状记录备份失败:', error);
      reject(error);
    }
  });
},

/**
 * 执行微信登录
 */
doWechatLogin() {
  console.log('开始微信登录流程');
  
  wx.login({
    success: (res) => {
      if (res.code) {
        console.log('微信登录成功，code:', res.code);
        // 调用云函数获取openid
        this.getUserOpenId(res.code);
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1500 });
      }
    },
    fail: (err) => {
      console.error('微信登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
  });
},


// ============ 备份触发方法 ============
/**
 * 执行备份（带智能判断）
 */
executeBackup() {
  const lastBackup = wx.getStorageSync('last_full_backup');
  const now = new Date().getTime();

   // 如果1小时内备份过，跳过
  if (lastBackup && (now - lastBackup) < 60 * 60 * 1000) {
    console.log('⏰ 1小时内已备份过，跳过');
    return Promise.resolve();
  }

  wx.showLoading({ title: '备份中...' });
  return UnifiedBackupManager.backupAllData().then(success => {
    if (success) {
      console.log('✅ 备份执行成功');
      wx.setStorageSync('last_full_backup', now);
    }
    return success;
  }).catch(error => {
    console.error('❌ 备份异常:', error);
    return false;
  }).finally(() => {
    wx.hideLoading();
  });
},

 

/**
 * 🆕 测试全量备份
 */
testFullBackup() {
  console.log('🧪 开始测试全量备份');
  
  // 清除备份时间限制，强制备份
  wx.removeStorageSync('last_full_backup');
  wx.removeStorageSync('last_backup_date');
  
  this.executeFullBackup();
},
/**
 * 测试备份功能
 */
testBackup: function() {
  console.log('🧪 开始测试备份功能');
  
  const records = StorageManager.getAllRecords();
  console.log('📋 本地记录:', records);
  
  if (records.length > 0) {
    console.log('🔍 第一条记录症状:', records[0].symptoms);
    console.log('🔍 症状详情:', records[0].symptoms[0]);
  }
  
  this.autoBackupSymptomRecords();
},
/**
 * 调用云函数获取openid
 */
getUserOpenId(code) {
  const existingOpenid = wx.getStorageSync('user_openid')
  if (existingOpenid && existingOpenid.startsWith('user_')) {
    console.log('🚫 使用现有用户标识，避免重复生成')
    this.setData({
      user_openid: existingOpenid
    })
    return
  }
  // 🆕 不使用云函数，直接通过云开发初始化获取 openid
  wx.cloud.callFunction({
    name: 'login',
    data: { code: code },
    success: (res) => {
      console.log('云函数返回:', res.result);
      
      // 🆕 如果云函数返回空，使用备用方案
      let openid = res.result.openid;
      
      if (!openid) {
        console.warn('⚠️ 云函数返回openid为空，使用云开发直接获取');
        
        // 🆕 备用方案：直接从云开发环境获取
        // 在小程序初始化时，云开发会自动获取 openid
        // 我们可以通过其他方式标识用户
        openid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('🔧 生成用户标识:', openid);
      }
      
      // 🆕 确保正确保存 openid
      wx.setStorageSync('user_openid', openid);
      console.log('✅ 用户标识已保存:', openid);
      
      // 🆕 立即触发一次全量备份
      setTimeout(() => {
        console.log('🔄 登录成功后触发全量备份');
        this.executeFullBackup();
      }, 2000);
    },
    fail: (err) => {
      console.error('获取openid失败:', err);
      // 🆕 失败时生成唯一用户标识
      const userIdentifier = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('user_openid', userIdentifier);
      console.log('🔧 生成备用用户标识:', userIdentifier);
      
      // 🆕 失败时也触发备份
      setTimeout(() => {
        console.log('🔄 使用备用标识触发全量备份');
        this.executeFullBackup();
      }, 2000);
    }
  });
},
/**
 * 查看完整协议
 */
viewFullProtocol: function() {
  console.log('查看完整协议');
  wx.navigateTo({
    url: '/pages/agreement/agreement?type=all&from=index'
  });
},
/**
 * 切换协议勾选状态
 */
toggleAgreementCheck: function() {
  // 🆕 修改：如果没有阅读过协议，提示并打开协议页面
  if (!this.data.hasReadProtocol) {
    wx.showToast({
      title: '请先阅读协议',
      icon: 'none',
      duration: 2000
    });
    
    // 自动打开协议页面
    wx.navigateTo({
      url: '/pages/agreement/agreement?type=all&from=index'
    });
    return;
  }
  
  // 如果已经阅读过协议，允许切换勾选状态
  const newState = !this.data.agreementChecked;
  console.log('切换协议勾选状态:', newState);
  
  this.setData({
    agreementChecked: newState
  });
},

/**
 * 🆕 新增：协议页面同意后的回调
 */
onProtocolAgreed: function() {
  console.log('用户已在协议页面点击同意');
  
  // 标记为已阅读协议，并自动勾选
  this.setData({
    hasReadProtocol: true,
    agreementChecked: true
  });
  
  wx.showToast({
    title: '已同意协议',
    icon: 'success',
    duration: 1500
  });
},
/**
 * 关闭协议弹窗
 */
closeAgreementModal() {
  console.log('🎯 closeAgreementModal 方法被调用');
  console.log('🎯 当前弹窗状态:', this.data.showAgreementModal);
  
  this.setData({
    showAgreementModal: false
  });
  
  console.log('🎯 弹窗已关闭');
},

/**
 * 查看用户协议
 */
viewUserAgreement: function() {
  console.log('查看用户协议');
  wx.navigateTo({
    url: '/pages/agreement/agreement?type=user&from=index'
  });
},

/**
 * 查看隐私政策
 */
viewPrivacyPolicy: function() {
  console.log('查看隐私政策');
  wx.navigateTo({
    url: '/pages/agreement/agreement?type=privacy&from=index'
  });
},

// ============ 微信登录相关方法 ============

/**
 * 微信登录按钮点击
 */
onWechatLogin() {
  const hasAgreed = wx.getStorageSync('user_agreed');
  
  if (!hasAgreed) {
    this.setData({ showAgreementModal: true });
    return;
  }
  
  this.doWechatLogin();
},

  

  // ============ 宝宝信息相关方法 ============
  
  /**
   * 初始化宝宝信息
   */
  initBabyInfo() {
    const babyInfo = StorageManager.getBabyInfo(); 
    this.setData({
      babyInfo: {
        name: babyInfo.name || '宝宝',
        age: babyInfo.age || '0岁0个月',
        birthday: babyInfo.birthday || '',
        avatarUrl: babyInfo.avatarUrl || '',
        energyRating: babyInfo.energyRating || 3
      }
    });
  },

  /**
   * 计算宝宝年龄
   */
  calculateAge() {
    const birthday = this.data.babyInfo.birthday;
    if (!birthday) return;

    const birth = new Date(birthday);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) { years--; months += 12; }
    if (today.getDate() < birth.getDate()) { months--; if (months < 0) { years--; months += 12; } }

    const ageStr = years > 0 ? `${years}岁${months}个月` :
                   months > 0 ? `${months}个月` : "新生儿";

    this.setData({ "babyInfo.age": ageStr });
  },

  /**
   * 编辑宝宝信息
   */
  editBabyInfo() {
    wx.navigateTo({ url: '/pages/edit-baby-info/edit-baby-info' });
  },

  // ============ 健康趋势相关方法 ============
  /**
 * 生成默认趋势数据（当没有症状记录时使用）
 */
generateDefaultTrendData() {
  const today = new Date();
  const trendData = [];
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    trendData.push({
      date: dateString,
      displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
      healthIndex: 100,
      symptomCount: 0,
      hasSymptoms: false
    });
  }
  
  return trendData;
},
/**
 * 计算健康趋势
 */
calculateHealthTrend() {
  this.setLoading('healthTrend', true);
  
  try {
    const records = StorageManager.getAllRecords();
    console.log('📋 原始记录数量:', records.length);
    
    const allSymptoms = records.flatMap(record => {
      if (record.symptoms && Array.isArray(record.symptoms)) {
        return record.symptoms.map(symptom => ({
          ...symptom,
          recordDate: record.date || symptom.timestamp
        }));
      }
      return [];
    });
    
    let trendData = [];
    if (allSymptoms.length === 0) {
      console.log('📊 无症状记录，使用默认数据');
      trendData = this.generateDefaultTrendData();
    } else {
      trendData = HEALTH_CALCULATION.generateHealthTrendData(allSymptoms);
    }
    
    const chartData = this.calculateChartPositions(trendData);
    const todayScore = (trendData[trendData.length - 1] && trendData[trendData.length - 1].healthIndex) || 100;

    this.setData({
      healthTrendData: chartData,
      currentHealthIndex: todayScore
    });
      
  } catch (error) {
    console.error('计算健康趋势失败:', error);
    const defaultData = this.generateDefaultTrendData();
    const chartData = this.calculateChartPositions(defaultData);
    this.setData({ healthTrendData: chartData, currentHealthIndex: 100 });
    // 🆕 修复：使用简单的错误提示替代 handleDataLoadError
    wx.showToast({ title: '健康趋势加载失败', icon: 'none' });
  } finally {
    this.setLoading('healthTrend', false);
  }
},

  /**
 * 计算图表位置
 */
calculateChartPositions(trendData) {
  if (!trendData || trendData.length === 0) return [];
  
  const scores = trendData.map(item => item.healthIndex);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore;
  
  const chartData = trendData.map((item, index) => {
    const position = (index / (trendData.length - 1)) * 100;
    const scorePosition = range === 0 ? 50 : ((item.healthIndex - minScore) / range) * 80 + 10;
    
    return { ...item, position, scorePosition };
  });

  const maxChartHeight = Math.max(...chartData.map(item => item.scorePosition));
  const yLabels = [];
  for (let i = 4; i >= 0; i--) {
    const value = minScore + (range * i / 4);
    yLabels.push(Math.round(value).toString());
  }

  this.setData({ chartLineHeight: maxChartHeight, yAxisLabels: yLabels });
  return chartData;
},

  /**
   * 刷新健康数据
   */
  refreshHealthData() {
    this.calculateHealthTrend();
    wx.showToast({ title: "已更新", icon: "success" });
  },

  // ============ 快速记录相关方法 ============
  
  /**
   * 快速记录入口
   */
  quickRecord(e) {
    const now = Date.now();
    if (now - (this.data.lastClickTime || 0) < 2000) {
      wx.showToast({ title: '操作过于频繁', icon: 'none' });
      return;
    }
    this.setData({ lastClickTime: now });
    
    const type = e.currentTarget.dataset.type;
    console.log('点击快速记录:', type);
    
    const recordConfig = {
      'mood': { type: 'emotion', selected: 'selectedEmotion', today: 'todayEmotion', default: 1 },
      'exercise': { type: 'exercise', selected: 'selectedExercise', today: 'todayExercise', default: '30-60' },
      'sleep': { type: 'sleep', selected: 'selectedSleep', today: 'todaySleep', default: 2 },
      'screentime': { type: 'screentime', selected: 'selectedScreenTime', today: 'todayScreenTime', default: 60 }
    };
    
    if (recordConfig[type]) {
      const config = recordConfig[type];
      this.setData({
        showQuickRecordModal: true,
        quickRecordType: config.type,
        [config.selected]: this.data[config.today] || config.default
      });
      return;
    }
    
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  /**
   * 选择情绪
   */
  selectEmotion(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedEmotion: level });
  },

  /**
   * 选择运动时长
   */
  selectExercise(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ selectedExercise: value });
  },

  /**
   * 选择睡眠时长
   */
  selectSleep(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedSleep: level });
  },

  /**
   * 选择电子产品时间
   */
  selectScreenTime(e) {
    const minutes = parseInt(e.currentTarget.dataset.minutes);
    this.setData({ selectedScreenTime: minutes });
  },

  /**
   * 保存快速记录
   */
  saveQuickRecord() {
    const { quickRecordType, selectedEmotion, selectedExercise, selectedSleep, selectedScreenTime } = this.data;
    
    const record = {
      emotion: this.getEmotionText(selectedEmotion),
      emotionLevel: selectedEmotion,
      exercise: selectedExercise,
      sleep: this.getSleepText(selectedSleep),
      sleepLevel: selectedSleep,
      screenTime: selectedScreenTime
    };

    if (StorageManager.saveEmotionExerciseRecord(record)) {
      this.loadTodayEmotionExercise();
      wx.showToast({ title: '记录成功', icon: 'success' });
      this.closeQuickRecordModal();
    } else {
      wx.showToast({ title: '记录失败', icon: 'none' });
    }
  },

  /**
   * 关闭快速记录弹窗
   */
  closeQuickRecordModal() {
    this.setData({ showQuickRecordModal: false });
    
    setTimeout(() => {
      this.setData({
        quickRecordType: '',
        selectedEmotion: 1,
        selectedExercise: '30-60',
        selectedSleep: 2,
        selectedScreenTime: 60
      });
    }, 300);
  },

  /**
   * 加载今日情绪运动状态
   */
  loadTodayEmotionExercise() {
    const todayRecord = StorageManager.getTodayEmotionExercise();
    if (todayRecord) {
      this.setData({
        todayEmotion: todayRecord.emotionLevel,
        todayExercise: todayRecord.exercise,
        todaySleep: todayRecord.sleepLevel,
        todayScreenTime: todayRecord.screenTime
      });
    }
  },

  // ============ 文本转换辅助方法 ============
  
  getEmotionText(level) {
    const emotions = { 1: '开心', 2: '平静', 3: '不开心' };
    return emotions[level] || '平静';
  },

  getExerciseText(value) {
    const exercises = {
      'under30': '低于30分钟',
      '30-60': '30分钟-1小时', 
      '1-2': '1-2小时',
      'over2': '大于2小时'
    };
    return exercises[value] || '30分钟-1小时';
  },

  getSleepText(level) {
    const sleepOptions = { 1: '低于8小时', 2: '8-10小时', 3: '10小时以上' };
    return sleepOptions[level] || '8-10小时';
  },

  // ============ 症状记录备份相关方法 ============
  /**
   * 症状保存后自动备份
   */
  onSymptomSaved() {
    console.log('💾 症状已保存，触发自动备份');
    
    // 延迟备份，确保数据已保存到本地
    setTimeout(() => {
      this.autoBackupSymptomRecords();
    }, 1000);
  },

  
  // ============ 签到功能相关方法 ============
  
  initCheckinData() {
    const checkinData = wx.getStorageSync('babyCheckinData') || {
      days: 0,
      lastCheckin: null
    };
    
    const today = new Date().toDateString();
    const isChecked = checkinData.lastCheckin === today;
    
    this.setData({
      checkinDays: checkinData.days,
      isChecked: isChecked
    });
  },

  /**
   * 处理签到
   */
  handleCheckin() {
    if (this.data.isChecked) {
      wx.showToast({ title: '今天已经签到过了', icon: 'none' });
      return;
    }
    
    const checkinData = wx.getStorageSync('babyCheckinData') || {
      days: 0,
      lastCheckin: null
    };
    
    const today = new Date();
    const todayStr = today.toDateString();
    let days = checkinData.days;
    const lastCheckin = checkinData.lastCheckin ? new Date(checkinData.lastCheckin) : null;
    
    if (lastCheckin) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastCheckin.toDateString() === yesterday.toDateString()) {
        days += 1;
      } else if (lastCheckin.toDateString() !== todayStr) {
        days = 1;
      }
    } else {
      days = 1;
    }
    
    const newData = { days: days, lastCheckin: todayStr };
    wx.setStorageSync('babyCheckinData', newData);
    
    this.setData({
      checkinDays: days,
      isChecked: true
      // 移除 showToast: true
    });
    // 使用浮动toast代替
wx.showToast({
  title: '签到成功 +1天',
  icon: 'success',
  duration: 2000
});
    
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  },

  // ============ 热门帖子相关方法 ============
  
  /**
   * 加载热门帖子
   */
  loadHotPosts() {
    this.setLoading('hotPosts', true);
    
    try {
      const storedPosts = wx.getStorageSync('experiencePosts') || [];
      let hotPosts = [];
      
      if (storedPosts.length > 0) {
        const sortedPosts = storedPosts.slice().sort((a, b) => {
          const scoreA = (a.likes || 0) + (a.cheers || 0);
          const scoreB = (b.likes || 0) + (b.cheers || 0);
          return scoreB - scoreA;
        });
        
        hotPosts = sortedPosts.slice(0, 3).map(post => ({
          id: post.id,
          title: post.title,
          author: post.author,
          likes: post.likes || 0,
          cheers: post.cheers || 0,
          content: post.content || ''
        }));
      }
      
      this.setData({ hotPosts });
    } catch (e) {
      console.error('加载热门帖子失败:', e);
      this.setData({ hotPosts: [] });
      this.handleDataLoadError('热门帖子');
    } finally {
      this.setLoading('hotPosts', false);
    }
  },

  /**
   * 点赞帖子
   */
  likePost(e) {
    e.stopPropagation();
    const postId = e.currentTarget.dataset.id;
    const posts = this.data.hotPosts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    });
    
    this.setData({ hotPosts: posts });
    wx.showToast({ title: '点赞成功', icon: 'success' });
  },

  /**
   * 鼓励帖子
   */
  cheerPost(e) {
    e.stopPropagation();
    const postId = e.currentTarget.dataset.id;
    const posts = this.data.hotPosts.map(post => {
      if (post.id === postId) {
        return { ...post, cheers: post.cheers + 1 };
      }
      return post;
    });
    
    this.setData({ hotPosts: posts });
    wx.showToast({ title: '鼓励成功', icon: 'success' });
  },


/**
 * 从云开发恢复数据（支持所有备份类型）
 */
async restoreFromCloud() {
  wx.showLoading({ title: '恢复数据中...' });
  
  const db = wx.cloud.database();
  const openid = wx.getStorageSync('user_openid');
  
  if (!openid) {
    wx.hideLoading();
    console.log('❌ 无openid，无法恢复数据');
    return;
  }
  
  try {
    // 查找所有类型的备份，按时间倒序
    const res = await db.collection('records')
  .where({ 
    openid: openid
  })
  .orderBy('backupTime', 'desc')
  .limit(5)
  .get();

    wx.hideLoading();
    
    if (res.data.length > 0) {
      // 🆕 优先使用全量备份，如果没有则使用症状备份
      const fullBackup = res.data.find(item => item.type === 'full_backup');
      const symptomBackup = res.data.find(item => item.type === 'symptom_backup');
      const userBackup = res.data.find(item => item.type === 'user_backup');
      
      const backupData = fullBackup || userBackup || symptomBackup || res.data[0];
      
      console.log('🔍 找到备份数据:', {
        类型: backupData.type,
        时间: backupData.backupTime || backupData.timestamp,
        记录数: backupData.symptoms ? backupData.symptoms.length : backupData.recordCount
      });
      
      this.restoreLocalData(backupData);
      wx.showToast({ title: '数据恢复成功', icon: 'success' });
    } else {
      console.log('📭 云端无备份数据');
      wx.showToast({ title: '无备份数据', icon: 'none' });
    }
  } catch (err) {
    wx.hideLoading();
    console.error('❌ 恢复数据失败:', err);
    wx.showToast({ title: '恢复失败', icon: 'none' });
  }
},

/**
 * 恢复本地数据
 */
restoreLocalData(backupData) {
  try {
    if (backupData.symptoms && backupData.symptoms.length > 0) {
      StorageManager.saveAllRecords(backupData.symptoms);
    }
    if (backupData.babyInfo) {
      StorageManager.saveBabyInfo(backupData.babyInfo);
    }
    console.log('✅ 本地数据恢复完成');
    
    // 刷新页面数据
    this.forceRefreshData();
  } catch (error) {
    console.error('❌ 恢复本地数据失败:', error);
  }
},

/**
 * 启动时检查并恢复数据
 */
checkAndRestoreData() {
  const localData = StorageManager.getAllRecords();
  if (localData.length === 0) {
    console.log('📭 本地无数据，尝试从云端恢复');
    this.restoreFromCloud();
  } else {
    console.log('✅ 本地有数据，无需恢复');
    // 定期备份到云端
    this.executeFullBackup();
  }
},
  // ============ 留言功能相关方法 ============
  
  /**
   * 打开留言弹窗
   */
  openChatModal() {
    this.setData({ showChatModal: true, messageContent: '' });
  },

  /**
   * 关闭留言弹窗
   */
  closeChatModal() {
    this.setData({ showChatModal: false, messageContent: '' });
  },

  /**
   * 监听留言输入
   */
  onMessageInput(e) {
    this.setData({ messageContent: e.detail.value });
  },

  /**
   * 从云开发获取留言
   */
  getMessagesFromCloud() {
    wx.showLoading({ title: '加载中...' });
    
    const db = wx.cloud.database();
    db.collection('records')
      .where({ type: 'message' })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        wx.hideLoading();
        this.setData({ messages: res.data });
      })
      .catch(err => {
        wx.hideLoading();
        console.error('从云开发获取留言失败:', err);
      });
  },

  /**
   * 提交留言
   */
  submitMessage() {
    const content = this.data.messageContent.trim();
    
    if (!content) {
      wx.showToast({ title: '请输入留言内容', icon: 'none' });
      return;
    }

    if (content.length < 5) {
      wx.showToast({ title: '留言内容至少5个字', icon: 'none' });
      return;
    }

    this.saveUserMessageToCloud(content);
  },

  /**
   * 保存用户留言到云开发
   */
  saveUserMessageToCloud(content) {
    wx.showLoading({ title: '提交中...' });

    const db = wx.cloud.database();
    db.collection('records').add({
      data: {
        content: content,
        createTime: new Date(),
        type: 'message',
        status: 'pending',
        timestamp: new Date().toLocaleString('zh-CN'),
        date: new Date().toISOString().split('T')[0],
        read: false
      },
      success: (res) => {
        wx.hideLoading();
        wx.showToast({ title: '留言成功', icon: 'success' });
        this.closeChatModal();
        this.getMessagesFromCloud();
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存留言失败:', err);
        wx.showToast({ title: '留言失败，请重试', icon: 'none' });
      }
    });
  },

  // ============ 页面导航方法 ============
  
  // 宝宝状态相关
  navToBabyStatus() { wx.navigateTo({ url: "/pages/baby-status/baby-status" }); },
  navToSymptomHistory() { wx.navigateTo({ url: "/pages/symptom-history/symptom-history" }); },
  
  // 饮食记录
  navToDietRecord() { wx.navigateTo({ url: "/pages/diet-record/diet-record" }); },
  
  // 日记相关
  navToDiary() { wx.navigateTo({ url: "/pages/diary-list/diary-list" }); },
  
  // 心情广场
  navToMap() { wx.navigateTo({ url: "/pages/mood-square/mood-square" }); },
  
  // 快速记录历史
  navToQuickRecordHistory() { wx.navigateTo({ url: "/pages/quick-record-history/quick-record-history" }); },
  
  // 经验交流
  goToExperienceList() { wx.navigateTo({ url: "/pages/experience-list/experience-list" }); },
  viewAllPosts() { this.goToExperienceList(); },
  
  // 帖子详情
  navToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    const post = this.data.hotPosts.find(p => p.id === postId);
    if (post) {
      wx.navigateTo({ url: `/pages/experience-detail/experience-detail?id=${postId}` });
    }
  },

  // ============ 工具方法 ============
  
  /**
   * 强制刷新数据
   */
  forceRefreshData() {
    this.calculateHealthTrend();
    this.loadTodayEmotionExercise();
    this.initCheckinData();
    this.loadHotPosts();
  },

  /**
   * 设置加载状态
   */
  setLoading(key, state) {
    this.setData({ [`loadingStates.${key}`]: state });
  },

  /**
   * 设置错误处理
   */
  setupErrorHandling() {
    this.onPageError = (error) => {
      console.error('页面错误:', error);
      wx.showToast({ title: '页面加载异常', icon: 'none' });
    };

    this.handleDataLoadError = (type) => {
      wx.showToast({ title: `${type}加载失败，请重试`, icon: 'none' });
    };
  },

  /**
   * 数据清理方法 - 安全版本（不删除用户记录）
   */
  cleanupOldData() {
    try {
      console.log('🔒 执行安全数据清理...');
      
      // 只清理临时缓存，绝对不清理用户记录！
      const now = Date.now();
      const tempKeys = ['temp_images', 'draft_data', 'cache_data'];
      
      tempKeys.forEach(key => {
        try {
          const data = wx.getStorageSync(key);
          if (data && data.expireTime && data.expireTime < now) {
            wx.removeStorageSync(key);
            console.log(`🗑️ 清理临时缓存: ${key}`);
          }
        } catch (e) {
          // 忽略错误
        }
      });
      
      // 清空健康指数缓存（这个可以清理，因为会重新计算）
      HEALTH_CALCULATION.clearCache();
      
      console.log('✅ 安全数据清理完成，用户记录完好无损');
    } catch (e) {
      console.error('数据清理失败:', e);
    }
  },

  /**
   * 分享功能
   */
  handleShare() {
    wx.showShareMenu({ 
      withShareTicket: true, 
      menus: ['shareAppMessage', 'shareTimeline'] 
    });
  }
});