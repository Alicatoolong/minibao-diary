// pages/experience-edit/experience-edit.js
const STORAGE_KEY = 'experiencePosts';

Page({
  data: {
    title: '',
    content: '',
    authorName: '',
    canSubmit: false  // 根据内容是否有文字来控制
  },

  onLoad() {
    this.getAuthorName();
  },

  // 从宝宝信息获取作者名
  getAuthorName() {
    try {
      const babyInfo = wx.getStorageSync('babyInfo') || {};
      if (babyInfo.name) {
        this.setData({
          authorName: `${babyInfo.name}妈妈`
        });
        return;
      }
      
      const app = getApp();
      if (app && app.globalData.userInfo) {
        this.setData({
          authorName: app.globalData.userInfo.nickName || '用户'
        });
        return;
      }
      
      this.setData({
        authorName: '宝妈'
      });
      
    } catch (e) {
      console.error('获取作者名失败:', e);
      this.setData({
        authorName: '宝妈'
      });
    }
  },

  onTitleInput(e) {
    const value = e.detail.value || '';
    this.setData({
      title: value
    });
  },

  onContentInput(e) {
    const value = e.detail.value || '';
    this.setData({
      content: value
    });
    // 只要内容有文字，按钮就可点击
    this.setData({
      canSubmit: value.trim().length > 0
    });
  },

  // 发布时验证标题
  submitPost() {
    const title = this.data.title.trim();
    const content = this.data.content.trim();

    // 验证标题
    if (title.length === 0) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      });
      return;
    }

    try {
      const stored = wx.getStorageSync(STORAGE_KEY) || [];
      const now = new Date();
      const id = Date.now();

      const authorName = this.data.authorName;

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
        isMine: true
      };

      const newList = [newPost, ...stored];
      wx.setStorageSync(STORAGE_KEY, newList);

      // 通知经验列表页面更新
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.publishNewPost) {
        prevPage.publishNewPost(newPost);
      }

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