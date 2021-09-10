// import lodash from 'lodash'

import { articlesCommonData, articlesCommonMethod } from '../../common/articles'
import { base_url } from '../../config'

const get_hotspots_url = base_url + "/esArticle/search/hotspots"

var objectInjectToPage = {
    useStore: true,
    data: {
        pageData: {
            pageType: "articles-search",
            isSearching: false,
            inputValue: "",
            hotspots: {},
            isShowingSearchResult: false,
            searchInputValue: ""
        },
        originPageData: {}
    },
    getArticlesSuccessCallBack: () => {
        tt.stopPullDownRefresh()
    },
    onShow() {
        this.data.pageData.articles.forEach(article => {
            article.isCurrentUserLike = article.likeDetails.map(likeDetail => likeDetail.user.id).includes(this.data.$state.currentUser.id)
            article.likeDetails.forEach(likeDetail => {
                if (likeDetail.user.id === this.data.$state.currentUser.id) likeDetail.user = {...this.data.$state.currentUser }
            })
            article.commentDetails.forEach(commentDetail => {
                if (commentDetail.fromUser.id === this.data.$state.currentUser.id) commentDetail.fromUser = {...this.data.$state.currentUser }
                if (commentDetail.toUser != null && commentDetail.toUser.id === this.data.$state.currentUser.id) commentDetail.toUser = {...this.data.$state.currentUser }
            })
        })
        this.setData({
            [`pageData.articles`]: this.data.pageData.articles
        })
    },
    onTapUserAvatar(e) {
        tt.navigateTo({
            url: '/pages/others/index?userId=' + e.target.dataset.userId
        })
    },
    onConfirmSearch(event) {
        console.log("onConfirmSearch", event)
        this.setData({
            [`pageData.isShowingSearchResult`]: true,
            [`pageData.searchInputValue`]: event.detail.inputValue,
            //页面状态还原
            // [`pageData`]: this.data.originPageData
            [`pageData.articles`]: [],
            [`pageData.articlePageNum`]: 0,
            [`pageData.loadingComplete`]: false,
            [`pageData.isNetworkFault`]: false,
            [`pageData.isServerFault`]: false
        }, () => {
            this.firstLoadArticles(event.detail.inputValue)
        })
    }
}
Object.assign(objectInjectToPage, articlesCommonMethod)
    //重写onload 文章不在onload加载 在点击搜索按钮后加载
objectInjectToPage.onLoad = function(options) {
    this.onLoadCommon(options)
    tt.request({
            url: get_hotspots_url,
            method: 'GET',
            success: (res) => {
                if (res.data.code === 200) {
                    this.data.pageData.hotspots.leftHotspots = res.data.data.slice(0, 5)
                    this.data.pageData.hotspots.rightHotspots = res.data.data.slice(5, 10)
                    this.setData({
                        [`pageData.hotspots`]: this.data.pageData.hotspots,
                        [`pageData.loadingComplete`]: true,
                    })
                }
            }
        })
        // this.data.originPageData = lodash.cloneDeep(this.data.pageData)
}
Object.assign(objectInjectToPage.data.pageData, articlesCommonData)
    //重写isGetSearchHotspots
objectInjectToPage.data.pageData.isGetSearchHotspots = true
Page(objectInjectToPage)