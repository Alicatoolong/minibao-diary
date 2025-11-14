// pages/experience-edit/experience-edit.js
const STORAGE_KEY = 'experiencePosts';

Page({
  data: {
    title: '',
    content: '',
    canSubmit: false
  },

  onTitleInput(e) {
    const value = e.detail.value || '';
    this.setData({
      title: value,
      canSubmit: !!(value.trim() && this.data.content.trim())
    });
  },

  onContentInput(e) {
    const value = e.detail.value || '';
    this.setData({
      content: value,
      canSubmit: !!(this.data.title.trim() && value.trim())
    });
  },

  submitPost() {
    if (!this.data.canSubmit) return;

    const title = this.data.title.trim();
    const content = this.data.content.trim();

    try {
      const stored = wx.getStorageSync(STORAGE_KEY) || [];
      const now = new Date();
      const id = Date.now();

      // 👇 这里先写死“乐乐妈妈”，后面可以从宝宝信息里读
      const authorName = '乐乐妈妈';

      const newPost = {
        id,
        author: authorName,
        title,
        content,
        likes: 0,
        cheers: 0,
        createdAt: `${now.getFullYear()}-${(now.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${now
          .getDate()
          .toString()
          .padStart(2, '0')} ${now
          .getHours()
          .toString()
          .padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,

        // ❗ 标记是当前用户发布的
        isMine: true
      };

      const newList = [newPost, ...stored];
      wx.setStorageSync(STORAGE_KEY, newList);

      wx.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      console.error('发布经验失败:', e);
      wx.showToast({
        title: '发布失败，请稍后再试',
        icon: 'none'
      });
    }
  },

  goBack() {
    wx.navigateBack();
  }
});
