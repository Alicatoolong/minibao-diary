// record.js
Page({
  data: {
    // 症状相关
    symptomTypes: [
      '眨眼', '皱鼻子', '歪嘴巴', '摇头',
      '耸肩', '清嗓子', '发出声音', '其他动作'
    ],
    selectedSymptom: "",
    selectedSeverity: 0,
    
    // 饮食相关
    dietTypes: ['早餐', '午餐', '晚餐', '零食'],
    selectedDiet: "",
    dietDetail: "",
    
    // 睡眠相关
    sleepHours: 8,
    sleepQuality: 3,
    
    // === 新增：营养补充相关 ===
    supplementTypes: [
      '维生素D', '鱼油', '钙剂', '镁剂', 
      '益生菌', '多维元素', '其他补充剂'
    ],
    selectedSupplements: [], // 改为数组，支持多种补充剂
    supplementDosage: '',
    supplementTime: '',
    customSupplement: '', // 自定义补充剂名称
    
    // === 新增：运动相关 ===
    activityTypes: [
      '户外游戏', '体育运动', '室内活动', '安静游戏'
    ],
    selectedActivity: "",
    activityDuration: 30, // 默认30分钟
    activityIntensity: 2, // 1-3低中高
    
    // === 新增：好转日标记 ===
    isGoodDay: false,
    improvementNotes: '',
    
    // 原有数据
    date: "",
    time: "",
    notes: ""
  },

  onLoad: function(options) {
    console.log('🎯 record页面onLoad被调用');
    this.setCurrentDateTime();
  },

  onShow: function() {
    console.log('👀 record页面显示');
  },

  // 设置当前日期时间
  setCurrentDateTime: function() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().substring(0, 5);
    
    this.setData({
      date: date,
      time: time
    });
  },

  // 症状选择方法
  selectSymptom: function(e) {
    const symptom = e.currentTarget.dataset.symptom;
    this.setData({
      selectedSymptom: symptom
    });
    console.log('选择症状:', symptom);
  },

  selectSeverity: function(e) {
    const severity = parseInt(e.currentTarget.dataset.severity);
    this.setData({
      selectedSeverity: severity
    });
    console.log('选择严重程度:', severity);
  },
// === 新增：营养补充相关方法 ===
  
  // 切换补充剂选择（可以多选）
  toggleSupplement: function(e) {
    console.log('点击补充剂事件:', e);
    
    // 确保获取到正确的补充剂名称
    const supplement = e.currentTarget.dataset.supplement;
    console.log('点击的补充剂:', supplement);
    
    // 创建数组的深拷贝，避免引用问题
    let currentSupplements = [...this.data.selectedSupplements];
    console.log('当前已选补充剂:', currentSupplements);
    
    const index = currentSupplements.indexOf(supplement);
    console.log('补充剂位置索引:', index);
    
    if (index > -1) {
      // 如果已经选中，就移除
      currentSupplements.splice(index, 1);
      console.log('移除补充剂，更新后:', currentSupplements);
    } else {
      // 如果没有选中，就添加
      currentSupplements.push(supplement);
      console.log('添加补充剂，更新后:', currentSupplements);
    }
    
    this.setData({
      selectedSupplements: currentSupplements
    });
    
    console.log('最终选择的补充剂:', this.data.selectedSupplements);
  },
  // === 新增：运动相关方法 ===
  
  // 选择活动类型
  selectActivity: function(e) {
    const activity = e.currentTarget.dataset.activity;
    this.setData({
      selectedActivity: activity
    });
    console.log('选择活动类型:', activity);
  },

  // 改变活动时长
  onActivityDurationChange: function(e) {
    const duration = parseInt(e.detail.value) || 30;
    this.setData({
      activityDuration: Math.min(Math.max(duration, 0), 180) // 限制0-180分钟
    });
  },debugSupplements: function() {
    console.log('=== 补充剂调试信息 ===');
    console.log('当前 selectedSupplements:', this.data.selectedSupplements);
    console.log('数据类型:', typeof this.data.selectedSupplements);
    console.log('数组长度:', this.data.selectedSupplements.length);
    console.log('完整数据:', this.data);
  },

  // 选择活动强度
  selectActivityIntensity: function(e) {
    const intensity = parseInt(e.currentTarget.dataset.intensity);
    this.setData({
      activityIntensity: intensity
    });
    console.log('选择活动强度:', intensity);
  },

  // === 新增：好转日标记方法 ===
  
  // 切换好转日标记
  toggleGoodDay: function() {
    this.setData({
      isGoodDay: !this.data.isGoodDay
    });
    console.log('标记好转日:', this.data.isGoodDay);
  },

  // 输入好转说明
  onImprovementNotesInput: function(e) {
    this.setData({
      improvementNotes: e.detail.value
    });
  },
  // 饮食相关方法
  selectDiet: function(e) {
    const diet = e.currentTarget.dataset.diet;
    this.setData({
      selectedDiet: diet
    });
    console.log('选择饮食类型:', diet);
  },
  
  onDietInput: function(e) {
    this.setData({
      dietDetail: e.detail.value
    });
  },
  
  // 睡眠相关方法
  onSleepChange: function(e) {
    const hours = parseFloat(e.detail.value) || 8;
    this.setData({
      sleepHours: Math.min(Math.max(hours, 0), 24)
    });
  },
  
  selectSleepQuality: function(e) {
    const quality = parseInt(e.currentTarget.dataset.quality);
    this.setData({
      sleepQuality: quality
    });
    console.log('选择睡眠质量:', quality);
  },

  // 日期时间选择
  onDateChange: function(e) {
    this.setData({
      date: e.detail.value
    });
  },

  onTimeChange: function(e) {
    this.setData({
      time: e.detail.value
    });
  },

  // 备注输入
  onNotesInput: function(e) {
    this.setData({
      notes: e.detail.value
    });
  },

  // 验证表单数据
  validateForm: function() {
    const { selectedSymptom, selectedSeverity, date, time } = this.data;
    
    if (!selectedSymptom) {
      wx.showToast({
        title: '请选择症状类型',
        icon: 'none'
      });
      return false;
    }

    if (selectedSeverity === 0) {
      wx.showToast({
        title: '请选择严重程度',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 保存记录方法 - 简化版本
  saveRecord: function() {
    if (!this.validateForm()) {
      return;
    }

    const { 
      selectedSymptom, 
      selectedSeverity, 
      selectedDiet, 
      dietDetail, 
      sleepHours, 
      sleepQuality,
      date,
      time,
      notes
    } = this.data;

    // 显示加载中提示
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    // 准备记录数据
    const recordData = {
      symptom: selectedSymptom,
      severity: selectedSeverity,
      date: new Date(),
      
      // 原有字段
      dietType: selectedDiet || '',
      dietDetail: dietDetail || '',
      sleepHours: sleepHours,
      sleepQuality: sleepQuality,
      notes: notes || '',
      
      // === 新增字段 ===
      supplements: this.data.selectedSupplements,
      customSupplement: this.data.customSupplement,
      supplementDosage: this.data.supplementDosage,
      supplementTime: this.data.supplementTime,
      activityType: this.data.selectedActivity,
      activityDuration: this.data.activityDuration,
      activityIntensity: this.data.activityIntensity,
      isGoodDay: this.data.isGoodDay,
      improvementNotes: this.data.improvementNotes
    };

    console.log('准备保存的记录:', recordData);

    // 直接使用云数据库保存（既然之前成功过）
    this.saveToCloudDatabase(recordData);
  },

  // 保存到云数据库 - 简化版本
  saveToCloudDatabase: function(recordData) {
    console.log('开始云数据库保存...');
    
    // 检查云开发是否可用
    if (typeof wx.cloud === 'undefined') {
      console.error('云开发不可用');
      this.fallbackToLocalStorage(recordData);
      return;
    }
  
    // 直接使用默认环境
    const db = wx.cloud.database();
    
    db.collection('records').add({
      data: recordData,
      success: res => {
        wx.hideLoading();
        console.log('云数据库保存成功，记录ID：', res._id);
        
        wx.showToast({
          title: '记录成功！',
          icon: 'success',
          duration: 1500
        });
  
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: err => {
        wx.hideLoading();
        console.error('云数据库保存失败：', err);
        
        // 云保存失败，回退到本地存储
        this.fallbackToLocalStorage(recordData);
      }
    });
  },
  
  // 回退到本地存储
  fallbackToLocalStorage: function(recordData) {
    console.log('回退到本地存储...');
    
    const success = this.saveToLocalStorage(recordData);
    
    if (success) {
      wx.showToast({
        title: '已保存到本地',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } else {
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 保存到本地缓存
  saveToLocalStorage: function(recordData, cloudId) {
    try {
      const existingRecords = wx.getStorageSync('healthRecords') || [];
      recordData._id = cloudId || 'local_' + Date.now();
      existingRecords.push(recordData);
      wx.setStorageSync('healthRecords', existingRecords);
      console.log('本地备份成功');
    } catch (e) {
      console.error('本地保存失败:', e);
    }
  },

  // 返回首页
  goBack: function() {
    wx.navigateBack();
  }
})