// 专门负责数据存储的工具类
const StorageManager = {
  // 保存所有记录数据
  saveAllRecords(records) {
    try {
      wx.setStorageSync('ticRecords', records);
      console.log('数据保存成功', records);
      return true;
    } catch (e) {
      console.error('数据保存失败:', e);
      return false;
    }
  },

  // 读取所有记录数据
  getAllRecords() {
    try {
      return wx.getStorageSync('ticRecords') || [];
    } catch (e) {
      console.error('数据读取失败:', e);
      return [];
    }
  }
};

// 导出这个工具类，以便在其他js文件中使用
module.exports = StorageManager;