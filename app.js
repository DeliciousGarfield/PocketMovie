//app.js

App({
  onLaunch: function () {
    this.globalData.watchList = wx.getStorageSync('watchList') || []
  },
  getWatchList: function() {
    return this.globalData.watchList
  },
  setWatchList: function(watchList) {
    this.globalData.watchList = watchList
    wx.setStorageSync('watchList', this.globalData.watchList)
  },
  globalData: {
    watchList: null
  }
})