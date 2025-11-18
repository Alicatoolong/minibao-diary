Page({
  data: {
    recordHistory: []
  },

  onLoad() {
    this.loadRecordHistory();
  },

  onShow() {
    this.loadRecordHistory();
  },

  // 加载记录历史
  loadRecordHistory() {
    try {
      const allRecords = wx.getStorageSync('emotionExerciseRecords') || {};
      const history = [];
      
      // 将对象转换为数组并按日期排序
      for (const [date, record] of Object.entries(allRecords)) {
        const recordDate = new Date(date);
        history.push({
          date: date,
          displayDate: `${recordDate.getMonth() + 1}月${recordDate.getDate()}日`,
          weekday: this.getWeekday(recordDate),
          emotion: record.emotion,
          emotionLevel: record.emotionLevel,
          exerciseMinutes: record.exerciseMinutes,
          sleep: record.sleep,
          sleepLevel: record.sleepLevel,
          timestamp: record.timestamp
        });
      }
      
      // 按日期倒序排列
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      this.setData({ recordHistory: history });
    } catch (error) {
      console.error('加载记录历史失败:', error);
      this.setData({ recordHistory: [] });
    }
  },

  // 获取星期几
  getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weekdays[date.getDay()];
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});