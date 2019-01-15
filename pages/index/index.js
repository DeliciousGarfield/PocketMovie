//index.js

import { taggedMovieApi, latestMovieApi, movieItemApi } from '../../constants/constants.js'

//获取应用实例
const app = getApp()

Page({
  data: {
    movieType: ['剧情', '喜剧', '动作', '爱情', '科幻', '动画', '悬疑', '惊悚', '恐怖', '犯罪', '同性', '音乐', '歌舞', '传记', '历史', '战争', '西部', '奇幻', '冒险', '灾难', '武侠', '情色'],
    movieTypeIndex: 0,
    movieOffset: 0,
    movieLoadCount: 20,
    recentMovieList: [],
    taggedMovieList: [],
    movieTitleMaxLen: 12,
    showModal: false,
    movieItem: null
  },
  preventTouchMove: function () {
    return
  },
  onLoad: function () {
    this.loadLatestMovies()
    this.loadMovieByTag(this.data.movieType[this.data.movieTypeIndex])
  },
  onReachBottom: function() {
    this.loadMovieByTag(this.data.movieType[this.data.movieTypeIndex])
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
  processMovieItem: function(movieItem) {
    if (movieItem.attrs.director != undefined) {
      movieItem.attrs.director = movieItem.attrs.director.slice(0, 5)
      for (let i in movieItem.attrs.director) {
        movieItem.attrs.director[i] = this.processMovieNames(movieItem.attrs.director[i])
      }
    }

    if (movieItem.attrs.writer != undefined) {
      movieItem.attrs.writer = movieItem.attrs.writer.slice(0, 5)
      for (let i in movieItem.attrs.writer) {
        movieItem.attrs.writer[i] = this.processMovieNames(movieItem.attrs.writer[i])
      }
    }
    
    if (movieItem.attrs.cast != undefined) {
      movieItem.attrs.cast = movieItem.attrs.cast.slice(0, 5)
      for (let i in movieItem.attrs.cast) {
        movieItem.attrs.cast[i] = this.processMovieNames(movieItem.attrs.cast[i])
      }
    }

    return movieItem
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
  processMovieNames: name => {
    if (name.codePointAt(0) > 255) {
      return name.split(' ', 1)
    }

    return name
  },
  onMovieTypeChange: function(e) {
    this.setData({ movieOffset: 0})
    this.setData({ taggedMovieList: []})
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
        this.setData({ recentMovieList: recentMovieInfo.subjects })
      },
      fail(err) {
        console.log(err)
      }
    })
  },
  loadMovieByTag: function(tag) {
    wx.request({
      url: `${taggedMovieApi}?sort=rank&tag=${tag}&page_limit=${this.data.movieLoadCount}&page_start=${this.data.movieOffset}`,
      header: {
        'content-type': 'json'
      },
      success: res => {
        let newLoadedMovieInfo = this.processTaggedMovieInfo(res.data)
        let taggedMovieList = this.data.taggedMovieList.concat(newLoadedMovieInfo.subjects)
        this.setData({ taggedMovieList: taggedMovieList})
      },
      fail(err) {
        console.log(err)
      }
    })

    this.setData({ movieOffset: this.data.movieOffset + this.data.movieLoadCount})
  },
  onMovieItemTap: function(e) {
    this.setData({ movieItem: null })
    let movieItemId = e.currentTarget.id
    wx.request({
      url: `${movieItemApi}/${movieItemId}`,
      header: {
        'content-type': 'json'
      },
      success: res => {
        let movieItem = this.processMovieItem(res.data)
        this.setData({ movieItem: movieItem })
      },
      fail(err) {
        console.log(err)
      }
    })
    this.setData({ showModal: true})
  },
  onMaskTap: function() {
    this.setData({ showModal: false })
  }
})
