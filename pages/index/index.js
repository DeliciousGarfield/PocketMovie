//index.js

import { taggedMovieApi, latestMovieApi } from '../../constants/constants.js'

//获取应用实例
const app = getApp()

Page({
  data: {
    movieType: ['剧情', '喜剧', '动作', '爱情', '科幻', '动画', '悬疑', '惊悚', '恐怖', '犯罪', '同性', '音乐', '歌舞', '传记', '历史', '战争', '西部', '奇幻', '冒险', '灾难', '武侠', '情色'],
    movieTypeIndex: 0,
    recentMovieInfo: null,
    newLoadedMovieInfo: null,
    movieTitleMaxLen: 12
  },
  onLoad: function () {
    this.loadLatestMovies()
    this.loadMovieByTag(this.data.movieTypeIndex)
  },
  processRecentMovieInfo: function(recentMovieInfo) {
    for (let subject of recentMovieInfo.subjects) {
      subject.rating.average = this.processMovieRating(subject.rating.average)
      subject.title = this.processMovieTitle(subject.title)
    }
    return recentMovieInfo
  },
  processTaggedMovieInfo: function(taggedMovieInfo) {
    for (let subject of taggedMovieInfo.subjects) {
      if (subject.title.length > this.data.movieTitleMaxLen) {
        subject.title = this.processMovieTitle(subject.title)
      }
    }
    return taggedMovieInfo
  },
  processMovieTitle: function(title) {
    if (title.length > this.data.movieTitleMaxLen) {
      title = title.substr(0, this.data.movieTitleMaxLen) + '...'
    }
    return title
  },
  processMovieRating: rating => {
    return rating.toFixed(1)
  },
  onMovieTypeChange: function(e) {
    let movieTypeIndex = Number.parseInt(e.detail.value)
    this.setData({ movieTypeIndex: movieTypeIndex})
    this.loadMovieByTag(this.data.movieType[movieTypeIndex])
  },
  loadLatestMovies: function() {
    wx.request({
      url: `${latestMovieApi}`,
      header: {
        'content-type': 'json'
      },
      success: res => {
        let recentMovieInfo = this.processRecentMovieInfo(res.data)
        this.setData({ 'recentMovieInfo': recentMovieInfo })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  loadMovieByTag: function(tag) {
    wx.request({
      url: `${taggedMovieApi}?sort=rank&tag=${tag}`,
      header: {
        'content-type': 'json'
      },
      success: res => {
        let newLoadedMovieInfo = this.processTaggedMovieInfo(res.data)
        this.setData({ 'newLoadedMovieInfo': newLoadedMovieInfo })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
})
