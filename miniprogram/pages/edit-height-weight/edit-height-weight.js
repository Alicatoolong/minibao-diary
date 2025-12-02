const app = getApp();

Page({
  data: {
    height: '',
    weight: '',
    isFormValid: false
  },

  onLoad: function(options) {
    // 可以加载今日已有记录
    this.loadTodayRecord();
  },

  // 加载今日记录
  loadTodayRecord: function() {
    const today = new Date().toISOString().split('T')[0];
    const records = wx.getStorageSync('heightWeightRecords') || {};
    const todayRecord = records[today];
    
    if (todayRecord) {
      this.setData({
        height: todayRecord.height.toString(),
        weight: todayRecord.weight.toString()
      });
      this.validateForm();
    }
  },

  // 身高输入 - 添加这个方法
  onHeightInput: function(e) {
    this.setData({
      height: e.detail.value
    });
    this.validateForm();
  },

  // 体重输入 - 添加这个方法
  onWeightInput: function(e) {
    this.setData({
      weight: e.detail.value
    });
    this.validateForm();
  },

  // 表单验证
  validateForm: function() {
    const { height, weight } = this.data;
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    
    const isValid = height && weight && 
                   heightNum >= 30 && heightNum <= 200 &&
                   weightNum >= 1 && weightNum <= 100;
    
    this.setData({
      isFormValid: isValid
    });
  },

  // 保存记录
  saveRecord: function() {
    if (!this.data.isFormValid) {
      wx.showToast({
        title: '请填写正确的身高体重',
        icon: 'none'
      });
      return;
    }

    const record = {
      height: parseFloat(this.data.height),
      weight: parseFloat(this.data.weight),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    // 使用 StorageManager 保存记录
    if (this.saveHeightWeightRecord(record)) {
      wx.showToast({
        title: '记录成功',
        icon: 'success'
      });
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } else {
      wx.showToast({
        title: '记录失败',
        icon: 'none'
      });
    }
  },

  // 保存记录到存储
  saveHeightWeightRecord: function(record) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingRecords = wx.getStorageSync('heightWeightRecords') || {};
      
      existingRecords[today] = {
        ...record,
        date: today,
        timestamp: new Date().toISOString()
      };
      
      wx.setStorageSync('heightWeightRecords', existingRecords);
      
      // 通知首页更新
      if (app.globalDataUpdateCallback) {
        app.globalDataUpdateCallback();
      }
      
      return true;
    } catch (e) {
      console.error('保存身高体重记录失败:', e);
      return false;
    }
  },

  goBack: function() {
    const pages = getCurrentPages();
    
    if (pages.length > 1) {
      // 有上一页，正常返回
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 没有上一页，使用 reLaunch 跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },
});