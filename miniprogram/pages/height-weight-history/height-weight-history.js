const app = getApp();

Page({
  data: {
    historyData: [],
    currentChart: 'height',
    heightChartData: [],
    weightChartData: [],
    recentHeightData: [],
    recentWeightData: [],
    chartLineHeight: 0,
    recentDays: 5,
    // 预定义颜色
    chartColors: {
      height: '#1890ff',
      weight: '#52c41a'
    }
  },

  onLoad: function(options) {
    this.loadHistoryData();
  },

  onShow: function() {
    this.loadHistoryData();
  },

  // 加载历史数据
  loadHistoryData: function() {
    try {
      const records = wx.getStorageSync('heightWeightRecords') || {};
      const recordArray = [];
      for (let date in records) {
        if (records.hasOwnProperty(date)) {
          recordArray.push({
            ...records[date],
            displayDate: this.formatDisplayDate(records[date].date),
            weekday: this.getWeekday(records[date].date),
            fullDate: this.formatFullDate(records[date].date)
          });
        }
      }
      
      // 按时间倒序排列（最新的在前面）
      recordArray.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      this.setData({
        historyData: recordArray
      }, () => {
        this.generateChartData(recordArray);
        this.generateRecentData(recordArray);
      });
    } catch (error) {
      console.error('加载历史数据失败:', error);
      this.setData({
        historyData: []
      });
    }
  },

  // 生成最近5天的图表数据
  generateRecentData: function(records) {
    if (records.length === 0) return;

    // 获取最近5条记录（按时间倒序，取最新的5条）
    const recentRecords = records.slice(0, this.data.recentDays).reverse();
    
    if (recentRecords.length === 0) return;

    // 处理身高数据
    const heightData = this.processRecentChartData(recentRecords, 'height');
    // 处理体重数据
    const weightData = this.processRecentChartData(recentRecords, 'weight');

    this.setData({
      recentHeightData: heightData,
      recentWeightData: weightData
    });
  },

  // 处理最近数据的图表坐标
  processRecentChartData: function(records, type) {
    const values = records.map(record => type === 'height' ? record.height : record.weight);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    return records.map((record, index) => {
      const value = type === 'height' ? record.height : record.weight;
      const position = (index / (records.length - 1)) * 100;
      const valuePosition = range === 0 ? 50 : ((value - minValue) / range) * 80 + 10;
      
      return {
        ...record,
        position: position,
        heightPosition: type === 'height' ? valuePosition : 0,
        weightPosition: type === 'weight' ? valuePosition : 0,
        chartDate: this.formatChartDate(record.date)
      };
    });
  },

  // 生成完整图表数据
  generateChartData: function(records) {
    if (records.length === 0) return;

    // 按时间正序排列用于图表显示
    const sortedRecords = records.slice().sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    // 计算身高范围
    var minHeight = sortedRecords[0].height;
    var maxHeight = sortedRecords[0].height;
    var heights = [];
    
    for (var i = 0; i < sortedRecords.length; i++) {
      var height = sortedRecords[i].height;
      heights.push(height);
      if (height < minHeight) minHeight = height;
      if (height > maxHeight) maxHeight = height;
    }
    
    var heightRange = maxHeight - minHeight;

    // 计算体重范围
    var minWeight = sortedRecords[0].weight;
    var maxWeight = sortedRecords[0].weight;
    var weights = [];
    
    for (var i = 0; i < sortedRecords.length; i++) {
      var weight = sortedRecords[i].weight;
      weights.push(weight);
      if (weight < minWeight) minWeight = weight;
      if (weight > maxWeight) maxWeight = weight;
    }
    
    var weightRange = maxWeight - minWeight;

    // 生成图表数据
    var heightChartData = [];
    var weightChartData = [];
    var maxChartHeight = 0;

    for (var i = 0; i < sortedRecords.length; i++) {
      var record = sortedRecords[i];
      var position = (i / (sortedRecords.length - 1)) * 100;
      
      var chartDisplayDate = this.formatChartDate(record.date);
      
      // 身高图表数据
      var heightPosition = heightRange === 0 ? 50 : ((record.height - minHeight) / heightRange) * 80 + 10;
      heightChartData.push({
        date: record.date,
        height: record.height,
        weight: record.weight,
        displayDate: chartDisplayDate,
        position: position,
        heightPosition: heightPosition
      });
      
      // 体重图表数据
      var weightPosition = weightRange === 0 ? 50 : ((record.weight - minWeight) / weightRange) * 80 + 10;
      weightChartData.push({
        date: record.date,
        height: record.height,
        weight: record.weight,
        displayDate: chartDisplayDate,
        position: position,
        weightPosition: weightPosition
      });
      
      maxChartHeight = Math.max(maxChartHeight, heightPosition, weightPosition);
    }

    this.setData({
      heightChartData: heightChartData,
      weightChartData: weightChartData,
      chartLineHeight: maxChartHeight
    });
  },

  // 切换图表类型
  switchChart: function(e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      currentChart: type
    });
  },

  // 格式化图表日期（月/日）
  formatChartDate: function(dateStr) {
    var date = new Date(dateStr);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return month + '/' + day;
  },

  // 其他方法保持不变...
  formatDisplayDate: function(dateStr) {
    var date = new Date(dateStr);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return month + '月' + day + '日';
  },

  formatFullDate: function(dateStr) {
    var date = new Date(dateStr);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return year + '年' + month + '月' + day + '日';
  },

  getWeekday: function(dateStr) {
    var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var date = new Date(dateStr);
    return weekdays[date.getDay()];
  },

  deleteRecord: function(e) {
    var date = e.currentTarget.dataset.date;
    var fullDate = this.formatFullDate(date);
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除 ' + fullDate + ' 的记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmDelete(date);
        }
      }
    });
  },

  confirmDelete: function(date) {
    try {
      var records = wx.getStorageSync('heightWeightRecords') || {};
      
      if (records[date]) {
        delete records[date];
        wx.setStorageSync('heightWeightRecords', records);
        
        this.loadHistoryData();
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        if (app.globalDataUpdateCallback) {
          app.globalDataUpdateCallback();
        }
      }
    } catch (error) {
      console.error('删除记录失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  goToEdit: function() {
    wx.navigateTo({
      url: '/pages/edit-height-weight/edit-height-weight'
    });
  },

  goBack: function() {
    wx.navigateBack();
  }
});