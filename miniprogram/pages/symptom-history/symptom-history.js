Page({
  data: {
    symptomRecords: []
  },

  onLoad: function(options) {
    console.log('📚 情况历史页面加载');
    this.loadSymptomRecords();
  },

  onShow: function() {
    console.log('🔄 情况历史页面显示');
    this.loadSymptomRecords();
  },

  // 加载情况记录
  loadSymptomRecords: function() {
    try {
      const records = wx.getStorageSync('symptomRecords') || [];
      // 按时间倒序排列
      const sortedRecords = records.sort((a, b) => b.id - a.id);
      this.setData({
        symptomRecords: sortedRecords
      });
      console.log('📥 加载到的历史记录:', sortedRecords);
    } catch (error) {
      console.error('💥 加载历史记录时出错:', error);
    }
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 跳转到编辑页面
  goToEdit: function() {
    wx.navigateTo({
      url: '/pages/edit-symptom/edit-symptom'
    });
  },

  // 编辑记录
  editRecord: function(e) {
    const id = e.currentTarget.dataset.id;
    console.log('✏️ 编辑记录 ID:', id);
    
    wx.navigateTo({
      url: `/pages/edit-symptom/edit-symptom?id=${id}`
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
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      console.log('✅ 删除成功，剩余记录:', records);
    } catch (error) {
      console.error('💥 删除记录时出错:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  }
})