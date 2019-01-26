//app.js

import { Cache } from 'utils/cache.js'

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
  getRecentMovieListCache: function() {
    this.globalData.recentMovieListCache = wx.getStorageSync('recentMovieListCache') || undefined
    return this.globalData.recentMovieListCache
  },
  setRecentMovieListCache: function (recentMovieListCache) {
    this.globalData.recentMovieListCache = recentMovieListCache
    wx.setStorageSync('recentMovieListCache', this.globalData.recentMovieListCache)
  },
  getMovieItemCache: function(movieId) {
    this.globalData.movieItemCache = wx.getStorageSync(`movieItemCache-${movieId}`) || undefined
    return this.globalData.movieItemCache
  },
  setMovieItemCache: function (movieId, movieItemCache) {
    this.globalData.movieItemCache = movieItemCache
    wx.setStorageSync(`movieItemCache-${movieId}`, this.globalData.movieItemCache)
  },
  getTaggedMovieListCache: function(tag) {
    this.globalData.taggedMovieListCache = wx.getStorageSync(`taggedMovieListCache-${tag}`) || undefined
    return this.globalData.taggedMovieListCache
  },
  setTaggedMovieListCache: function (tag, taggedMovieListCache) {
    this.globalData.taggedMovieListCache = taggedMovieListCache
    wx.setStorageSync(`taggedMovieListCache-${tag}`, this.globalData.taggedMovieListCache)
  },
  getTaggedMovieListStore: function(tag) {
    this.globalData.taggedMovieListStore = wx.getStorageSync(`taggedMovieListStore-${tag}`) || []
    return this.globalData.taggedMovieListStore
  },
  setTaggedMovieListStore: function(tag, taggedMovieListStore) {
    this.globalData.taggedMovieListStore = taggedMovieListStore
    wx.setStorageSync(`taggedMovieListStore-${tag}`, this.globalData.taggedMovieListStore)
  },
  globalData: {
    watchList: null,
    recentMovieListCache: null,
    movieItemCache: null,
    taggedMovieListCache: null,
    taggedMovieListStore: null
  }
})