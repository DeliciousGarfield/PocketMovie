//app.js

App({
  onLaunch: function () {
    this.globalData.watchList = new Set(wx.getStorageSync('watchList') || [])
  },
  globalData: {
    watchList: null
  }
})