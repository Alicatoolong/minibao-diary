Page({
  data: {
    records: [],
    mealTimeMap: {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐'
    }
  },

  onLoad() {
    this.loadRecords();
  },

  onShow() {
    // 从编辑页返回时刷新一下
    this.loadRecords();
  },

  // 读取本地存储中的饮食记录
  loadRecords() {
    try {
      const records = wx.getStorageSync('dietRecords') || [];
      // 按时间从近到远排序（id 是时间戳）
      records.sort((a, b) => (b.id || 0) - (a.id || 0));

      this.setData({ records });
      console.log('📋 记录详情页加载记录：', records);
    } catch (e) {
      console.error('读取记录失败', e);
      wx.showToast({
        title: '读取记录失败',
        icon: 'none'
      });
      this.setData({ records: [] });
    }
  },

  // 点击整条记录 → 跳转到饮食记录页，编辑模式
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    console.log('📝 编辑记录 id =', id);

    wx.navigateTo({
      url: `/pages/diet-record/diet-record?mode=edit&id=${id}`
    });
  },

  // 删除按钮
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    console.log('🗑 准备删除记录 id =', id);

    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条饮食记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteRecord(id);
        }
      }
    });
  },

  // 真正执行删除
  deleteRecord(id) {
    try {
      const all = wx.getStorageSync('dietRecords') || [];
      const remain = all.filter(item => String(item.id) !== String(id));
      wx.setStorageSync('dietRecords', remain);

      wx.showToast({
        title: '已删除',
        icon: 'success'
      });

      // 刷新当前列表
      this.loadRecords();
    } catch (e) {
      console.error('删除失败', e);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
