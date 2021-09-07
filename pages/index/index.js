import { articlesCommonData, articlesCommonMethod } from '../../common/articles'

if (tt.canIUse('onKeyboardComplete')) {
    console.log("onKeyboardComplete")
}
var objectInjectToPage = {
    useStore: true,
    data: {
        pageData: {
            pageType: "articles-home-page",
            //刷新
            isRefreshing: false
        },
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
    onTapRefresh() {
        this.data.pageData.pageNum += 1
        this.setData({
            [`pageData.isRefreshing`]: true,
            [`pageData.articles`]: []
        }, () => {
            setTimeout(() => {
                this.getArticles()
            }, 2);
        })
    },
    onPullDownRefresh() {
        this.onTapRefresh()
    },
    onTouchReload() {
        this.onLoad()
    }
}
Object.assign(objectInjectToPage, articlesCommonMethod)
Object.assign(objectInjectToPage.data.pageData, articlesCommonData)
Page(objectInjectToPage)