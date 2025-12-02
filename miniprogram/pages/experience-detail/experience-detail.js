// pages/experience-detail/experience-detail.js
const STORAGE_KEY = 'experiencePosts';

Page({
  data: {
    post: null,
    prevPostId: null,
    nextPostId: null
  },

  onLoad(options) {
    // 优先从 url 参数里拿 id
    if (options && options.id) {
      const id = Number(options.id);
      this.loadPostById(id);
    } else {
      // 兼容以前用 eventChannel 传数据的写法
      const channel =
        this.getOpenerEventChannel && this.getOpenerEventChannel();
      if (channel) {
        channel.on('postData', (data) => {
          if (data && data.id) {
            this.loadPostById(data.id);
          } else {
            this.setData({ post: data || null });
          }
        });
      }
    }
  },

  // 根据 id 从本地存储读取帖子，并计算上一条 / 下一条
  loadPostById(id) {
    try {
      const stored = wx.getStorageSync(STORAGE_KEY) || [];
      if (!stored.length) {
        this.setData({ post: null, prevPostId: null, nextPostId: null });
        return;
      }

      // 按时间顺序（id 倒序）排一下
      const list = stored.slice().sort((a, b) => b.id - a.id);
      const index = list.findIndex((p) => p.id === id);
      if (index === -1) {
        this.setData({ post: null, prevPostId: null, nextPostId: null });
        return;
      }

      const post = list[index];
      const prev = index > 0 ? list[index - 1] : null;
      const next = index < list.length - 1 ? list[index + 1] : null;

      this.setData({
        post,
        prevPostId: prev ? prev.id : null,
        nextPostId: next ? next.id : null
      });
    } catch (e) {
      console.error('加载经验详情失败:', e);
      this.setData({ post: null, prevPostId: null, nextPostId: null });
    }
  },

  // 新增：处理点赞
  handleLike() {
    const post = this.data.post;
    if (!post) return;

    try {
      const storedPosts = wx.getStorageSync(STORAGE_KEY) || [];
      const updatedPosts = storedPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            likes: (p.likes || 0) + 1
          };
        }
        return p;
      });

      // 更新存储
      wx.setStorageSync(STORAGE_KEY, updatedPosts);
      
      // 更新页面数据
      this.setData({
        'post.likes': (post.likes || 0) + 1
      });

      wx.showToast({
        title: '点赞成功',
        icon: 'success',
        duration: 1000
      });

    } catch (e) {
      console.error('点赞失败:', e);
      wx.showToast({
        title: '点赞失败',
        icon: 'none'
      });
    }
  },

  // 新增：处理鼓励
  handleCheer() {
    const post = this.data.post;
    if (!post) return;

    try {
      const storedPosts = wx.getStorageSync(STORAGE_KEY) || [];
      const updatedPosts = storedPosts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            cheers: (p.cheers || 0) + 1
          };
        }
        return p;
      });

      // 更新存储
      wx.setStorageSync(STORAGE_KEY, updatedPosts);
      
      // 更新页面数据
      this.setData({
        'post.cheers': (post.cheers || 0) + 1
      });

      wx.showToast({
        title: '鼓励成功',
        icon: 'success',
        duration: 1000
      });

    } catch (e) {
      console.error('鼓励失败:', e);
      wx.showToast({
        title: '鼓励失败',
        icon: 'none'
      });
    }
  },

  // 上一条
  goPrev() {
    const id = this.data.prevPostId;
    if (!id) return;
    wx.redirectTo({
      url: `/pages/experience-detail/experience-detail?id=${id}`
    });
  },

  // 下一条
  goNext() {
    const id = this.data.nextPostId;
    if (!id) return;
    wx.redirectTo({
      url: `/pages/experience-detail/experience-detail?id=${id}`
    });
  },

  goBack() {
    wx.navigateBack();
  }
});