//app.js

App({
  onLaunch: function () {
    this.globalData.watchList = wx.getStorageSync('watchList') || []
    this.globalData.lauchCount = wx.getStorageSync('lauchCount') || 0
    this.addLauchCount()
  },
  getWatchList: function() {
    return this.globalData.watchList
  },
  setWatchList: function(watchList) {
    this.globalData.watchList = watchList
    wx.setStorageSync('watchList', this.globalData.watchList)
  },
  getLauchCount: function() {
    return this.globalData.lauchCount
  },
  addLauchCount: function() {
    this.globalData.lauchCount += 1
    wx.setStorageSync('lauchCount', this.globalData.lauchCount)
  },
  globalData: {
    watchList: null,
    lauchCount: 0
  }
})