//index.js

import { taggedMovieApi, latestMovieApi, movieItemApi, MILLISECONDS_PER_DAY } from '../../constants/constants.js'
import { Cache } from '../../utils/cache.js'

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
    movieItem: null,
    recentMovieLoadStatus: 0, // 0:loading, 1:success, 2:fail
    taggedMovieLoadStatus: 0, // 同上
    watchList: null,
    editMode: false,
    oldWatchList: null,
    filterType: 2,
    currentWatched: null,
    currentUnwatched: null,
    hasCurrentWatched: false,
    taggedMovieEnd: false
  },
  onLoad: function () {
    this.setWatchList(app.getWatchList())
    this.loadLatestMovies()
    this.loadMovieByTag(this.data.movieType[this.data.movieTypeIndex])
  },
  setWatchList: function(aWatchList) {
    let watchList = {}
    for (let movieId of aWatchList) {
      watchList[movieId] = null
    }

    this.setData({ watchList: watchList })
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
    this.resetTaggedMovieList()
    let movieTypeIndex = Number.parseInt(e.detail.value)
    this.setData({ movieTypeIndex: movieTypeIndex})
    this.loadMovieByTag(this.data.movieType[movieTypeIndex])
  },
  loadLatestMovies: function() {
    let recentMovieListCache = app.getRecentMovieListCache()
    if (recentMovieListCache != undefined && new Date().getTime() - recentMovieListCache.cacheTime <= recentMovieListCache.expireTime) {
      this.setData({ recentMovieList: recentMovieListCache.cacheItem })
      this.setData({ recentMovieLoadStatus: 1 })
    }
    else {
      let onSuccess = (res) => {
        let recentMovieInfo = this.processRecentMovieInfo(res.data)
        let recentMovieList = recentMovieInfo.subjects
        this.setData({ recentMovieList: recentMovieList })
        this.setData({ recentMovieLoadStatus: 1 })

        let recentMovieListCache = new Cache(recentMovieList, new Date().getTime(), MILLISECONDS_PER_DAY)
        app.setRecentMovieListCache(recentMovieListCache)
      }

      let onError = (err) => {
        setTimeout(() => this.setData({ recentMovieLoadStatus: 2 }), 1000)
        console.log(err)
      }

      wx.request({
        url: `${latestMovieApi}`,
        header: {
          'content-type': 'json'
        },
        success: res => {
          if (res.statusCode == 200) {
            onSuccess(res)
          }
          else {
            onError(res)
          }
        },
        fail: err => {
          onError(err)
        }
      })
    }
  },
  refreshCurrentWatchState: function (taggedMovieList) {
    let currentWatched = {}
    let currentUnwatched = {}
    let watchList = new Set(app.getWatchList())
    for (let movieItem of taggedMovieList) {
      if (watchList.has(movieItem.id)) {
        currentWatched[movieItem.id] = null
      }
      else {
        currentUnwatched[movieItem.id] = null
      }
    }

    if (Object.keys(currentWatched).length != 0) {
      this.setData({ hasCurrentWatched: true})
    }
    else {
      this.setData({ hasCurrentWatched: false })
    }
    this.setData({ currentWatched: currentWatched })
    this.setData({ currentUnwatched: currentUnwatched })
  },
  loadMovieByTag: function(tag) {
    if (!this.data.taggedMovieEnd) {
      let taggedMovieListCache = app.getTaggedMovieListCache(tag)
      if (taggedMovieListCache != undefined && new Date().getTime() - taggedMovieListCache.cacheTime <= taggedMovieListCache.expireTime && taggedMovieListCache.cacheItem.length > this.data.movieOffset) {
        let newLoadedMovieList = taggedMovieListCache.cacheItem.slice(this.data.movieOffset, this.data.movieOffset + this.data.movieLoadCount)
        let taggedMovieList = this.data.taggedMovieList.concat(newLoadedMovieList)
        this.setData({ taggedMovieList: taggedMovieList })
        this.setData({ taggedMovieLoadStatus: 1 })
        this.setData({ movieOffset: this.data.movieOffset + newLoadedMovieList.length })
        if (newLoadedMovieList.length == 0) {
          this.setData({ taggedMovieEnd: true })
        }
        this.refreshCurrentWatchState(taggedMovieList)
        console.log(this.data.movieOffset)
      }
      else {
        let onSuccess = (res) => {
          let newLoadedMovieInfo = this.processTaggedMovieInfo(res.data)
          let taggedMovieList = this.data.taggedMovieList.concat(newLoadedMovieInfo.subjects)
          this.setData({ taggedMovieList: taggedMovieList })
          this.setData({ taggedMovieLoadStatus: 1 })
          this.setData({ movieOffset: this.data.movieOffset + newLoadedMovieInfo.subjects.length })
          if (newLoadedMovieInfo.subjects.length == 0) {
            this.setData({ taggedMovieEnd: true})
          }

          let taggedMovieListCache = new Cache(taggedMovieList, new Date().getTime(), MILLISECONDS_PER_DAY)
          app.setTaggedMovieListCache(tag, taggedMovieListCache)

          this.refreshCurrentWatchState(taggedMovieList)
        }

        let onError = (err) => {
          setTimeout(() => this.setData({ taggedMovieLoadStatus: 2 }), 1000)
          if (this.data.taggedMovieList.length != 0) {
            wx.showToast({
              title: '获取更多内容失败，请稍后重试',
              icon: 'none',
              duration: 2000
            })
          }

          console.log(err)
        }

        wx.request({
          url: `${taggedMovieApi}?sort=rank&tag=${tag}&page_limit=${this.data.movieLoadCount}&page_start=${this.data.movieOffset}`,
          header: {
            'content-type': 'json'
          },
          success: res => {
            if (res.statusCode == 200) {
              onSuccess(res)
            }
            else {
              onError(res)
            }
          },
          fail: err => {
            onError(err)
          }
        })
      }
    }
  },
  onMovieItemTap: function(e) {
    this.resetMovieItem()
    this.setData({ showModal: true })
    let movieItemId = e.currentTarget.id

    let movieItemCache = app.getMovieItemCache(movieItemId)
    if (movieItemCache != undefined && new Date().getTime() - movieItemCache.cacheTime <= movieItemCache.expireTime) {
      this.setData({ movieItem: movieItemCache.cacheItem })
    }
    else {
      let onSuccess = (res) => {
        let movieItem = this.processMovieItem(res.data)
        this.setData({ movieItem: movieItem })

        let movieItemCache = new Cache(movieItem, new Date().getTime(), MILLISECONDS_PER_DAY * 7)
        app.setMovieItemCache(movieItemId, movieItemCache)
      }

      let onError = (err) => {
        setTimeout(() => this.setData({ showModal: false }), 1000)
        wx.showToast({
          title: '加载失败，请稍后重试',
          icon: 'none',
          duration: 2000
        })
        console.log(err)
      }

      wx.request({
        url: `${movieItemApi}/${movieItemId}`,
        header: {
          'content-type': 'json'
        },
        success: res => {
          if (res.statusCode == 200) {
            onSuccess(res)
          }
          else {
            onError(res)
          }
        },
        fail: err => {
          onError(err)
        }
      })
    }
  },
  onMoiveItemLongTap: function() {
    if (!this.data.editMode) {
      this.setData({ oldWatchList: this.data.watchList })
      this.setData({ editMode: true })      
    }
  },
  onMaskTap: function() {
    this.setData({ showModal: false })
  },
  onRefreshRecentMovieList: function() {
    this.setData({ recentMovieLoadStatus: 0 })
    this.loadLatestMovies()
  },
  onRefreshTaggedMovieList: function() {
    this.resetTaggedMovieList()
    this.setData({ taggedMovieLoadStatus: 0 })
    this.loadMovieByTag(this.data.movieType[this.data.movieTypeIndex])
  },
  onMovieItemCheckboxChange: function(e) {
    let checkedMovieItemIds = new Set(e.detail.value)
    let unCheckedMovieItemIds = new Set()

    if (this.data.filterType == 0) {
      let movieItemIds = new Set(this.data.taggedMovieList.map(movieItem => movieItem.id))
      unCheckedMovieItemIds = new Set([...movieItemIds].filter(x => !checkedMovieItemIds.has(x)))
    }
    else if (this.data.filterType == 1) {
      for (let movieId in this.data.currentWatched) {
        if (!checkedMovieItemIds.has(movieId)) {
          unCheckedMovieItemIds.add(movieId)
        }
      }
    }
    else if (this.data.filterType == 2) {
      for (let movieId in this.data.currentUnwatched) {
        if (!checkedMovieItemIds.has(movieId)) {
          unCheckedMovieItemIds.add(movieId)
        }
      }
    }

    let oldWatchList = []
    for (let movieId in this.data.watchList) {
      oldWatchList.push(movieId)
    }

    let watchList = new Set([...oldWatchList, ...checkedMovieItemIds])
    watchList = new Set([...watchList].filter(x => !unCheckedMovieItemIds.has(x)))

    this.setWatchList(watchList)
  },
  onEditConfirm: function() {
    let watchList = []
    for (let movieId in this.data.watchList) {
      watchList.push(movieId)
    }

    app.setWatchList(watchList)
    this.setData({ editMode: false })

    this.refreshCurrentWatchState(this.data.taggedMovieList)
  },
  onEditCancel: function() {
    this.setData({ watchList: this.data.oldWatchList })
    this.setData({ editMode: false})
  },
  onMovieListFilterChange: function(e) {
    if (e.detail.value.length != 0) {
      for (let filterType of e.detail.value) {
        if (!(filterType == this.data.filterType)) {
          this.setData({ filterType: filterType })
        }
      }
    }
  },
  resetMovieItem: function() {
    this.setData({ movieItem: null })
  },
  resetTaggedMovieList: function() {
    this.setData({ movieOffset: 0 })
    this.setData({ taggedMovieList: [] })
    this.setData({ taggedMovieEnd: false})
  }
})
