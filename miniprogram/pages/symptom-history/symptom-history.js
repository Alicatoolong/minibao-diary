// symptom-history.js
Page({
  data: {
    symptomRecords: [],
    isLoading: false
  },

  onLoad: function(options) {
    console.log('📚 情况历史页面加载');
    this.loadSymptomRecords();
  },

  onShow: function() {
    console.log('🔄 情况历史页面显示');
    this.loadSymptomRecords();
  },

  onPullDownRefresh: function() {
    console.log('🔄 下拉刷新');
    this.loadSymptomRecords();
  },

  onShareAppMessage: function() {
    return {
      title: '宝宝情况记录',
      path: '/pages/symptom-history/symptom-history'
    };
  },

  onShareTimeline: function() {
    return {
      title: '宝宝情况记录'
    };
  },

  // 加载情况记录
  loadSymptomRecords: function() {
    this.setData({ isLoading: true });
    
    try {
      const records = wx.getStorageSync('symptomRecords') || [];
      console.log('🔍 原始存储数据:', records);
      
      if (records.length > 0) {
        console.log('📋 第一条记录详情:', records[0]);
        if (records[0].symptoms && records[0].symptoms.length > 0) {
          console.log('🩺 第一个状况详情:', records[0].symptoms[0]);
        }
      }
      
      // 处理状况数据 - 从 symptoms 数组中提取
      const formattedRecords = records.map(record => {
        // 从 symptoms 数组中获取第一个状况
        let description = '未知状况';
        let severity = 0;
        let severityText = '未知';
        
        if (record.symptoms && record.symptoms.length > 0) {
          const symptomData = record.symptoms[0];
          
          // 使用 symptomName 字段
          description = symptomData.symptomName || '未知状况';
          
          // 使用 severityLevel 字段获取数字，severity 字段获取文本
          severity = symptomData.severityLevel || 0;
          severityText = symptomData.severity || '未知';
        }
        
        // 获取时间 - 使用记录的 timestamp 或 date
        const time = record.timestamp || record.date;
        
        return {
          ...record,
          description: description,
          severity: severity,
          severityText: severityText,
          formattedTime: this.formatTime(time)
        };
      });
      
      const sortedRecords = formattedRecords.sort((a, b) => {
        // 按ID或时间倒序
        if (b.id && a.id) return b.id - a.id;
        if (b.timestamp && a.timestamp) return new Date(b.timestamp) - new Date(a.timestamp);
        return 0;
      });
      
      this.setData({
        symptomRecords: sortedRecords
      });
    } catch (error) {
      console.error('💥 加载历史记录时出错:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 时间格式化方法
  formatTime: function(timeStr) {
    if (!timeStr) return '未知时间';
    
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (recordDate.getTime() === today.getTime()) {
        return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
    } catch (error) {
      return timeStr;
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 跳转到编辑页面（添加新记录）
  goToEdit: function() {
    wx.navigateTo({
      url: '/pages/edit-symptom/edit-symptom'
    });
  },

  // 删除记录
  deleteRecord: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('🗑️ 删除记录 ID:', id);
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条情况记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteSymptomRecord(id);
        }
      }
    });
  },

  // 删除情况记录
  deleteSymptomRecord: function(id) {
    try {
      let records = wx.getStorageSync('symptomRecords') || [];
      records = records.filter(record => record.id !== id);
      
      wx.setStorageSync('symptomRecords', records);
      
      // 重新加载数据
      this.loadSymptomRecords();
      
      // 🆕 触发备份到云开发
      this.triggerBackup();
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('💥 删除记录时出错:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 🆕 触发备份到云开发
  triggerBackup: function() {
    try {
      console.log('💾 症状记录变更，触发云备份...');
      
      // 方法1：通过全局回调
      const app = getApp();
      if (app && app.globalDataUpdateCallback) {
        console.log('🔄 通过全局回调触发备份');
        app.globalDataUpdateCallback();
      }
      
      // 方法2：直接调用首页备份方法
      const pages = getCurrentPages();
      const indexPage = pages.find(page => page.route === 'pages/index/index');
      if (indexPage && indexPage.onSymptomSaved) {
        console.log('🔄 直接调用首页备份方法');
        indexPage.onSymptomSaved();
      } else {
        console.log('⚠️ 未找到首页备份方法，尝试其他方式');
        // 方法3：通过存储事件触发
        wx.setStorageSync('need_backup', true);
      }
      
      console.log('✅ 备份触发完成');
    } catch (error) {
      console.error('❌ 触发备份失败:', error);
    }
  }
});