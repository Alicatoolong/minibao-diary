// 创建测试用的公开心情日记
const testDiaries = [
  {
    id: 1,
    author: '乐乐妈妈',
    mood: 1, // 开心
    content: '今天宝宝第一次笑出声，心都化了！',
    tags: ['成长', '开心'],
    isPublic: true,
    createTime: new Date().toISOString(),
    hugCount: 12
  },
  {
    id: 2, 
    author: '辰辰妈妈',
    mood: 3, // 不开心
    content: '宝宝最近总摇头，有点担心',
    tags: ['担忧', '症状'],
    isPublic: true,
    createTime: new Date().toISOString(),
    hugCount: 8
  }
];

wx.setStorageSync('diaryRecords', testDiaries);
console.log('测试数据创建成功！');// 健康趋势计算
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

  calculateFrequencyFactor(frequency) {
    if (!frequency) return 1.0;
    const freq = parseInt(frequency) || 0;
    if (freq <= 10) return 1.0;
    if (freq <= 30) return 1.2;
    if (freq <= 50) return 1.5;
    if (freq <= 100) return 1.8;
    return 2.0;
  },

  calculateDailyHealthIndex(symptoms) {
    if (!symptoms || symptoms.length === 0) return 100;

    let totalImpact = 0;
    let symptomCount = 0;

    symptoms.forEach(symptom => {
      if (symptom.type === 'asymptomatic') return;

      const weight = this.SYMPTOM_WEIGHTS[symptom.type] || 1.0;
      const severityFactor = this.SEVERITY_FACTORS[symptom.level] || 1.0;
      const frequencyFactor = this.calculateFrequencyFactor(symptom.frequency);

      totalImpact += weight * severityFactor * frequencyFactor;
      symptomCount++;
    });

    if (symptomCount > 0) {
      const avgImpact = totalImpact / symptomCount;
      return Math.max(0, Math.round(100 - avgImpact * 8));
    }

    return 100;
  },

  generateHealthTrendData(symptoms) {
    const trendData = [];
    const today = new Date();

    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dailySymptoms = symptoms.filter(s => {
        if (!s.date) return false;
        return new Date(s.date).toDateString() === date.toDateString();
      });

      trendData.push({
        date: date.toISOString().split('T')[0],
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        healthIndex: this.calculateDailyHealthIndex(dailySymptoms),
        symptomCount: dailySymptoms.length,
        hasSymptoms: dailySymptoms.length > 0
      });
    }

    return trendData;
  }
}

// 数据存储
const StorageManager = {
  saveAllRecords(records) {
    try { wx.setStorageSync('symptomRecords', records); return true; }
    catch (e) { return false; }
  },
  getAllRecords() {
    try { return wx.getStorageSync('symptomRecords') || []; }
    catch (e) { return []; }
  },
  saveBabyInfo(info) {
    try { wx.setStorageSync('babyBasicInfo', info); return true; }
    catch (e) { return false; }
  },
  getBabyInfo() {
    try { return wx.getStorageSync('babyBasicInfo') || {}; }
    catch (e) { return {}; }
  },
  // 新增：保存情绪运动记录
saveEmotionExerciseRecord(record) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existingRecords = wx.getStorageSync('emotionExerciseRecords') || {};
    
    // 每日覆盖，只保留最新记录
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

// 新增：获取今日情绪运动记录（放在 StorageManager 内部）
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

Page({
  data: {
    babyInfo: {
      name: '',
      age: '',
      birthday: '',
      healthStatus: '',
      healthRating: 0
    },

    // 新增：快速记录弹窗相关
    showQuickRecordModal: false,
    quickRecordType: '', // 'emotion' 或 'exercise'
    selectedEmotion: 1, // 1:开心 2:平静 3:不开心
    selectedExercise: 60, // 运动分钟数
    selectedSleep: 2, // 1:低于8小时 2:8-10小时 3:10小时以上
    todayEmotion: null, // 今日情绪状态
    todayExercise: null, // 今日运动状态
    todaySleep: null, // 今日睡眠状态

    healthTrendData: [],
    currentHealthIndex: 100,
    trendLines: [],

    hotPosts: [
      { 
        id: 1, 
        author: '乐乐妈妈', 
        title: '孩子总清嗓子，我是怎么办的', 
        likes: 12, 
        cheers: 5,
        content: '我家孩子之前总是清嗓子，后来发现是过敏性鼻炎引起的...',
        tags: ['清嗓子', '过敏性鼻炎', '经验分享']
      },
      { 
        id: 2, 
        author: '辰辰妈妈', 
        title: '睡前总眨眼怎么办？', 
        likes: 8, 
        cheers: 3,
        content: '孩子睡前眨眼频繁，经过一段时间的调理现在好多了...',
        tags: ['眨眼', '睡前', '调理']
      },
      { 
        id: 3, 
        author: '果果妈妈', 
        title: '饮食调整后抽动减少', 
        likes: 15, 
        cheers: 9,
        content: '通过调整饮食结构，孩子的抽动症状明显改善...',
        tags: ['饮食', '抽动', '改善']
      }
    ],

    showChatModal: false
  },

  onLoad() {
    this.loadBabyInfo();
    this.calculateAge();
    this.calculateHealthTrend();
    this.loadTodayEmotionExercise(); // 新增
  },

  onShow() {
    this.calculateAge();
    this.calculateHealthTrend();
    this.loadTodayEmotionExercise(); // 新增
  },

  // ---------------------------------------
  // 加载宝宝信息
  // ---------------------------------------
  loadBabyInfo() {
    const info = StorageManager.getBabyInfo();
    if (info && info.name) {
      this.setData({ babyInfo: { ...this.data.babyInfo, ...info } });
    }
  },

  // ---------------------------------------
  // 计算年龄
  // ---------------------------------------
  calculateAge() {
    const birthday = this.data.babyInfo.birthday;
    if (!birthday) return;

    const birth = new Date(birthday);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) { years--; months += 12; }
    if (today.getDate() < birth.getDate()) { months--; if (months < 0) { years--; months += 12; } }

    const ageStr =
      years > 0 ? `${years}岁${months}个月` :
      months > 0 ? `${months}个月` : "新生儿";

    this.setData({ "babyInfo.age": ageStr });
  },

  // ---------------------------------------
  // 计算趋势 & 折线
  // ---------------------------------------
  calculateHealthTrend() {
    const symptoms = StorageManager.getAllRecords();

    let trendData = [];
    if (symptoms.length === 0) {
      trendData = this.generateDefaultTrendData();
    } else {
      trendData = HEALTH_CALCULATION.generateHealthTrendData(symptoms);
    }

    const todayScore = trendData[trendData.length - 1].healthIndex;

    this.setData({
      healthTrendData: trendData,
      currentHealthIndex: todayScore
    });

    this.updateTrendLines(trendData);
  },

  // 默认数据（无记录时）
  generateDefaultTrendData() {
    const today = new Date();
    const arr = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push({
        date: d.toISOString().split("T")[0],
        displayDate: `${d.getMonth() + 1}/${d.getDate()}`,
        healthIndex: 85 + Math.floor(Math.random() * 11),
        symptomCount: 0,
        hasSymptoms: false
      });
    }
    return arr;
  },

  // ⭐ 正确的折线计算（点连点）
  updateTrendLines(trendData) {
    if (!trendData || trendData.length < 2) {
      this.setData({ trendLines: [] });
      return;
    }

    const lines = [];
    const total = trendData.length - 1;
    const stepX = 100 / total;

    for (let i = 0; i < total; i++) {
      const p1 = trendData[i];
      const p2 = trendData[i + 1];

      const x1 = stepX * i;
      const x2 = stepX * (i + 1);
      const y1 = p1.healthIndex;
      const y2 = p2.healthIndex;

      const dx = x2 - x1;
      const dy = y2 - y1;

      lines.push({
        left: x1,
        bottom: y1,
        length: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
      });
    }

    this.setData({ trendLines: lines });
  },

  refreshHealthData() {
    this.calculateHealthTrend();
    wx.showToast({ title: "已更新", icon: "success" });
  },

  onDataPointTap(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: `${item.displayDate} 状态详情`,
      content: `状态分：${item.healthIndex}分\n记录：${item.symptomCount}条`,
      showCancel: false
    });
  },

  // ---------------------------------------
  // 核心导航功能
  // ---------------------------------------
  navToBabyStatus() {
    wx.navigateTo({ url: "/pages/baby-status/baby-status" });
  },

  navToDietRecord() {
    wx.navigateTo({ url: "/pages/diet-record/diet-record" });
  },

  navToDiary() {
    wx.navigateTo({ url: "/pages/diary-list/diary-list" });
  },

// 跳转到心情广场
navToMap() {
  wx.navigateTo({ 
    url: "/pages/mood-square/mood-square" });
},
  
// 跳转到快速记录历史页面
navToQuickRecordHistory() {
  console.log('跳转到快速记录历史页面');
  wx.navigateTo({ 
    url: "/pages/quick-record-history/quick-record-history" 
  });
},
  // ---------------------------------------
  // 经验交流相关跳转
  // ---------------------------------------
  
  // 修复：添加缺失的 goToExperienceList 方法
  goToExperienceList() {
    console.log('跳转到经验列表页面');
    wx.navigateTo({ 
      url: "/pages/experience-list/experience-list" 
    });
  },

  // 跳转到帖子详情
  navToPostDetail(e) {
    const postId = e.currentTarget.dataset.id;
    const post = this.data.hotPosts.find(p => p.id === postId);
    
    if (post) {
      wx.navigateTo({
        url: `/pages/experience-detail/experience-detail?id=${postId}`
      });
    }
  },

  // 查看全部经验帖子
  viewAllPosts() {
    this.goToExperienceList();
  },

  // 点赞帖子
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

  // 鼓励帖子
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

  // ---------------------------------------
  // 其他功能
  // ---------------------------------------
  
  // 聊天弹窗
  openChatModal() { 
    this.setData({ showChatModal: true }); 
  },
  
  closeChatModal() { 
    this.setData({ showChatModal: false }); 
  },  // ← 这里需要加逗号！这是问题所在
  

  handleShare() {
    wx.showShareMenu({ 
      withShareTicket: true, 
      menus: ['shareAppMessage', 'shareTimeline'] 
    });
  },  // ← 这个逗号是正确的

  
  quickRecord(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击快速记录:', type);
    
    // 情绪记录
    if (type === 'mood') {
      this.setData({
        showQuickRecordModal: true,
        quickRecordType: 'emotion',
        selectedEmotion: this.data.todayEmotion || 1
      });
      return;
    }
    
    // 运动记录  
    if (type === 'exercise') {
      this.setData({
        showQuickRecordModal: true,
        quickRecordType: 'exercise',
        selectedExercise: this.data.todayExercise || 60
      });
      return;
    }
    
    // 睡眠记录 - 弹出选择窗口
    if (type === 'sleep') {
      this.setData({
        showQuickRecordModal: true,
        quickRecordType: 'sleep',
        selectedSleep: this.data.todaySleep || 2
      });
      return;
    }
    
    // 其他类型
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

// 情绪选择
selectEmotion(e) {
  const level = parseInt(e.currentTarget.dataset.level);
  this.setData({
    selectedEmotion: level
  });
},

// 运动时长选择
selectExercise(e) {
  const minutes = parseInt(e.currentTarget.dataset.minutes);
  this.setData({
    selectedExercise: minutes
  });
},
// 睡眠时长选择
selectSleep(e) {
  const level = parseInt(e.currentTarget.dataset.level);
  this.setData({
    selectedSleep: level
  });
},

// 睡眠文本转换
getSleepText(level) {
  const sleepOptions = { 
    1: '低于8小时', 
    2: '8-10小时', 
    3: '10小时以上' 
  };
  return sleepOptions[level] || '8-10小时';
},
// 保存快速记录
saveQuickRecord() {
  const { quickRecordType, selectedEmotion, selectedExercise, selectedSleep } = this.data;
  
  const record = {
    emotion: this.getEmotionText(selectedEmotion),
    emotionLevel: selectedEmotion,
    exerciseMinutes: selectedExercise,
    sleep: this.getSleepText(selectedSleep),
    sleepLevel: selectedSleep
  };

  if (StorageManager.saveEmotionExerciseRecord(record)) {
    // 更新首页显示
    this.loadTodayEmotionExercise();
    
    wx.showToast({
      title: '记录成功',
      icon: 'success'
    });
    
    this.closeQuickRecordModal();
  } else {
    wx.showToast({
      title: '记录失败',
      icon: 'none'
    });
  }
},

// 关闭弹窗
closeQuickRecordModal() {
  // 先隐藏内容，再隐藏整个弹窗
  this.setData({
    showQuickRecordModal: false
  });
  
  // 延迟重置数据，避免 DOM 操作冲突
  setTimeout(() => {
    this.setData({
      quickRecordType: '',
      selectedEmotion: 1,
      selectedExercise: 60,
      selectedSleep: 2
    });
  }, 300);
},

// 加载今日情绪运动睡眠状态
loadTodayEmotionExercise() {
  const todayRecord = StorageManager.getTodayEmotionExercise();
  if (todayRecord) {
    this.setData({
      todayEmotion: todayRecord.emotionLevel,
      todayExercise: todayRecord.exerciseMinutes,
      todaySleep: todayRecord.sleepLevel
    });
  }
},

// 情绪文本转换
getEmotionText(level) {
  const emotions = { 1: '开心', 2: '平静', 3: '不开心' };
  return emotions[level] || '平静';
}
}); 