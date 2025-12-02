// pages/experience-list/experience-list.js

// 添加默认帖子数据定义
const DEFAULT_POSTS = [
  {
    id: 1,
    title: "如何保持积极心态？",
    content: "分享一些保持积极心态的方法和经验...",
    author: "自学心理的芬芬",
    date: "2024-01-15",
    likes: 15,
    cheers: 3,
    comments: 5,
    isMine: false,
    createdAt: "1月15日"
  },
  {
    id: 2,
    title: "改善睡眠质量的小技巧",
    content: "良好的睡眠对心理健康非常重要...",
    author: "爱睡觉的甜甜妈妈", 
    date: "2024-01-14",
    likes: 12,
    cheers: 2,
    comments: 4,
    isMine: false,
    createdAt: "1月14日"
  },
  {
    id: 3,
    title: "正念冥想入门指南",
    content: "学习正念冥想，提升心理韧性...",
    author: "喜欢冥想的乐乐妈妈",
    date: "2024-01-13",
    likes: 20,
    cheers: 5,
    comments: 8,
    isMine: false,
    createdAt: "1月13日"
  }
];

const STORAGE_KEY = 'experiencePosts';

Page({
  data: {
    allPosts: [],
    posts: [],
    currentSort: 'hot',
    currentScope: 'all',
    myAuthorName: '',// 初始为空
    pageSize: 10,      // 每页数量
    currentPage: 1,    // 当前页码
    hasMore: true,     // 是否有更多数据
  },

  onLoad() {
    this.getCurrentUser();
    this.loadPosts();
  },

  onShow() {
    this.loadPosts();
  },

  // 获取当前用户信息
  getCurrentUser() {
    // 方式1：从全局数据获取
    const app = getApp();
    if (app && app.globalData.userInfo) {
      this.setData({
        myAuthorName: app.globalData.userInfo.nickName || '用户'
      });
      return;
    }
  },

  // 微信登录获取用户信息（可选）
  loginAndGetUserInfo() {
    wx.getUserProfile({
      desc: '用于展示用户信息',
      success: (res) => {
        const userInfo = res.userInfo;
        this.setData({
          myAuthorName: userInfo.nickName
        });
        
        // 保存到全局数据
        if (getApp()) {
          getApp().globalData.userInfo = userInfo;
        }
      },
      fail: () => {
        // 如果获取失败，使用默认名称
        this.setData({
          myAuthorName: '用户'
        });
      }
    });
  },

  // 删除帖子
  onDeletePost: function(e) {
    const postId = e.currentTarget.dataset.id;
    const that = this;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条经验吗？删除后无法恢复',
      confirmColor: '#ff4d4f',
      success: function(res) {
        if (res.confirm) {
          that.deletePost(postId);
        }
      }
    });
  },

  // 执行删除操作
  deletePost: function(postId) {
    // 获取所有帖子列表，不仅仅是当前显示的
    let allPosts = this.data.allPosts;
    
    // 过滤掉要删除的帖子
    const updatedAllPosts = allPosts.filter(post => post.id !== postId);
    
    // 更新数据
    this.setData({
      allPosts: updatedAllPosts
    });
    
    // 更新本地存储
    this.updateLocalStorage(updatedAllPosts);
    
    // 重新更新显示列表
    this.updatePosts();
    
    // 新增：通知首页更新
    this.notifyHomePageUpdate();
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },

  // 更新本地存储
  updateLocalStorage: function(posts) {
    try {
      wx.setStorageSync(STORAGE_KEY, posts);
    } catch (e) {
      console.error('更新存储失败:', e);
    }
  },

  // 修改 loadPosts 方法，重置分页
loadPosts() {
  try {
    let stored = wx.getStorageSync(STORAGE_KEY) || [];
    console.log('📂 经验广场加载帖子，数量:', stored.length);
    if (!stored.length) {
      console.log('📂 使用默认帖子数据');
      stored = DEFAULT_POSTS;
      wx.setStorageSync(STORAGE_KEY, stored);
    }

    this.setData(
      {
        allPosts: stored,
        currentPage: 1  // 重置为第一页
      },
      () => {
        this.updatePosts();
      }
    );
  } catch (e) {
    console.error('加载经验帖子失败:', e);
    this.setData({ allPosts: [], posts: [] });
  }
},

  // 根据当前筛选 & 排序，生成 posts
  updatePosts() {
    const { allPosts, currentSort, currentScope, myAuthorName, pageSize, currentPage } = this.data;
    let list = allPosts.slice();

    // 先按"我发布的"过滤
    if (currentScope === 'mine') {
      list = list.filter((p) => p.isMine || p.author === myAuthorName);
    }

    // 排序
    if (currentSort === 'hot') {
      list.sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.cheers || 0);
        const scoreB = (b.likes || 0) + (b.cheers || 0);
        return scoreB - scoreA;
      });
    } else if (currentSort === 'new') {
      list.sort((a, b) => b.id - a.id);
    }

    // 分页逻辑
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedList = list.slice(0, startIndex + pageSize);
    const hasMore = list.length > startIndex + pageSize;

    this.setData({ 
      posts: paginatedList,
      hasMore: hasMore
    });
  },

  // 新增加载更多方法
  loadMore() {
    if (!this.data.hasMore) return;
    
    this.setData({
      currentPage: this.data.currentPage + 1
    }, () => {
      this.updatePosts();
    });
  },

  // 切换排序：最热 / 最新
  // 修改切换排序方法
onSortTap(e) {
  const sort = e.currentTarget.dataset.sort;
  if (sort === this.data.currentSort) return;

  this.setData(
    {
      currentSort: sort,
      currentPage: 1  // 重置为第一页
    },
    () => {
      this.updatePosts();
    }
  );
},

  // 修改切换范围方法
onScopeTap(e) {
  const scope = e.currentTarget.dataset.scope;
  if (scope === this.data.currentScope) return;

  this.setData(
    {
      currentScope: scope,
      currentPage: 1  // 重置为第一页
    },
    () => {
      this.updatePosts();
    }
  );
},

  goBack() {
    wx.navigateBack();
  },

  // 去发经验
  goToPostEdit() {
    wx.navigateTo({
      url: '/pages/experience-edit/experience-edit'
    });
  },

  // 点击某条经验 → 进入详情页（保留这一个方法）
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    wx.navigateTo({
      url: `/pages/experience-detail/experience-detail?id=${id}`
    });
  },

  // 新增：发布新帖子的方法（在编辑页面调用）
  publishNewPost(newPost) {
    const allPosts = this.data.allPosts || [];
    const updatedPosts = [newPost, ...allPosts];
    
    this.setData({
      allPosts: updatedPosts
    });
    
    // 更新存储
    this.updateLocalStorage(updatedPosts);
    
    // 重新更新显示列表
    this.updatePosts();
    
    console.log('💾 发布后更新存储，帖子数量:', updatedPosts.length);
    
    // 新增：通知首页更新
    this.notifyHomePageUpdate();
  },

  // 新增：通知首页更新方法
  notifyHomePageUpdate() {
    // 通过全局回调通知首页
    const app = getApp();
    if (app && app.globalDataUpdateCallback) {
      console.log('📢 通知首页更新经验帖子');
      app.globalDataUpdateCallback();
    }
  }
});