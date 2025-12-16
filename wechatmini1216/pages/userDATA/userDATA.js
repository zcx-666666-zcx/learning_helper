Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalStudyTime: 0,        // 总学习时长(分钟)
    studyCount: 0,            // 学习次数
    focusPercentage: 0,       // 平均专注度
    fatigueCount: 0,          // 疲劳次数
    goodPosturePercentage: 0, // 良好姿态比例
    poorPostureCount: 0,      // 不良姿态次数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时获取用户学习数据
    this.loadStudyData();
  },

  /**
   * 加载学习数据
   */
  loadStudyData() {
    const app = getApp();
    
    // 检查用户是否已登录
    if (!app.globalData.USERNAME) {
      // 尝试从本地存储获取用户名
      const storedUsername = wx.getStorageSync('username');
      if (storedUsername) {
        app.globalData.USERNAME = storedUsername;
      } else {
        console.error('用户未登录');
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        
        // 跳转到登录页面
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/login/login'
          });
        }, 1500);
        return;
      }
    }
    
    // 获取用户ID（如果全局变量中没有，则直接通过用户名获取学习数据）
    let userId = app.globalData.USER_ID;
    if (!userId) {
      // 如果没有用户ID，直接通过用户名获取学习数据
      this.loadStudyDataByUsername(app.globalData.USERNAME);
      return;
    }
    
    // 从后端获取学习统计数据（通过用户ID）
    wx.request({
      url: `https://1151290dt34oy.vicp.fun/api/study/stats/${userId}`,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          const stats = res.data.data;
          
          // 计算专注度 (良好姿态时间占总学习时间的比例)
          let focusPercentage = 0;
          if (stats.totalStudyDuration > 0) {
            focusPercentage = Math.round(
              ((stats.totalStudyDuration - stats.totalPoorPostureDuration - stats.totalFatigueDuration) / 
              stats.totalStudyDuration) * 100
            );
          }
          
          // 计算良好姿态比例
          let goodPosturePercentage = 0;
          if (stats.totalStudyDuration > 0) {
            goodPosturePercentage = Math.round(
              ((stats.totalStudyDuration - stats.totalPoorPostureDuration - stats.totalFatigueDuration) / 
              stats.totalStudyDuration) * 100
            );
          }
          
          this.setData({
            totalStudyTime: Math.floor(stats.totalStudyDuration / 60), // 转换为分钟
            studyCount: stats.totalStudySessions,
            focusPercentage: focusPercentage,
            fatigueCount: stats.fatigueCount,
            goodPosturePercentage: goodPosturePercentage,
            poorPostureCount: stats.poorPostureCount
          });
        } else {
          console.error('获取学习数据失败:', res.data.message);
          wx.showToast({
            title: res.data.message || '数据加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('获取学习数据失败:', err);
        // 如果通过用户ID获取失败，尝试通过用户名获取
        this.loadStudyDataByUsername(app.globalData.USERNAME);
      }
    });
  },

  /**
   * 通过用户名加载学习数据
   */
  loadStudyDataByUsername(username) {
    wx.request({
      url: 'https://1151290dt34oy.vicp.fun/api/study/stats/username/' + username,
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          const stats = res.data.data;
          
          // 计算专注度 (良好姿态时间占总学习时间的比例)
          let focusPercentage = 0;
          if (stats.totalStudyDuration > 0) {
            focusPercentage = Math.round(
              ((stats.totalStudyDuration - stats.totalPoorPostureDuration - stats.totalFatigueDuration) / 
              stats.totalStudyDuration) * 100
            );
          }
          
          // 计算良好姿态比例
          let goodPosturePercentage = 0;
          if (stats.totalStudyDuration > 0) {
            goodPosturePercentage = Math.round(
              ((stats.totalStudyDuration - stats.totalPoorPostureDuration - stats.totalFatigueDuration) / 
              stats.totalStudyDuration) * 100
            );
          }
          
          this.setData({
            totalStudyTime: Math.floor(stats.totalStudyDuration / 60), // 转换为分钟
            studyCount: stats.totalStudySessions,
            focusPercentage: focusPercentage,
            fatigueCount: stats.fatigueCount,
            goodPosturePercentage: goodPosturePercentage,
            poorPostureCount: stats.poorPostureCount
          });
        } else {
          console.error('获取学习数据失败:', res.data.message);
          wx.showToast({
            title: res.data.message || '数据加载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('通过用户名获取学习数据失败:', err);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 下拉刷新数据
    this.loadStudyData();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})