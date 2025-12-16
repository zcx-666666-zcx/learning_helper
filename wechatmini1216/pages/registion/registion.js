// pages/registion/registion.js

Page({
  data: {
    username: '',
    password: '',
    surePassword: '',
    province: '',
    city: '',
    age: '',
    showError: false
  },

  nameHandle(e) {
    this.setData({ username: e.detail.value });
  },

  passwordHandle(e) {
    this.setData({ password: e.detail.value });
  },

  sureHandle(e) {
    this.setData({ surePassword: e.detail.value });
  },

  provinceHandle(e) {
    this.setData({ province: e.detail.value });
  },

  cityHandle(e) {
    this.setData({ city: e.detail.value });
  },

  ageHandle(e) {
    this.setData({ age: e.detail.value });
  },

  regHandle() {
    const { username, password, surePassword, province, city, age } = this.data;

    if (!username || !password || !surePassword || !province || !city || !age) {
      this.setData({ showError: true });
      wx.showToast({ title: '请输入完整内容', icon: 'none' });
      return;
    }
    if (password !== surePassword) {
      this.setData({ showError: true });
      wx.showToast({ title: '密码输入不一致', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '注册中...' });

    wx.request({
      url: 'https://1151290dt34oy.vicp.fun/api/user/register',
      method: 'POST',
      data: { 
        username, 
        password,
        province,
        city,
        age: parseInt(age) 
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          wx.showToast({ title: '注册成功', icon: 'success' });
          wx.navigateBack();
        } else {
          wx.showToast({ title: res.data.message || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '请求失败，请检查服务器', icon: 'none' });
      }
    });
  }
});