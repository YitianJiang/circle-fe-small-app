import { base_url } from '../config'
import { solvelong } from 'solvelong'
import { myRequest } from '../api/request'
const time = require('time')
const string = require('string')
const position = require('position')
const emoji = require('emoji')

const create_like_url = base_url + "/like/create"
const delete_like_url = base_url + "/like/delete"
const create_comment_url = base_url + "/comment/create"
const delete_comment_url = base_url + "/comment/delete"
const get_more_comments_url = base_url + "/comment/getByArticleId"
const get_more_likes_url = base_url + "/like/get"

const initial_interact_container_width = "0rpx"
const unfold_interact_container_width = "280rpx"
const font_size = 32
const textarea_one_line_height = 45
const textarea_two_line_height = textarea_one_line_height + font_size
const textarea_three_line_height = textarea_two_line_height + 1.5 * font_size
const zero_dot_five_second = "0.35s"
const zero_second = "0s"
const input_text = "input-text"
const input_emoji = "input-emoji"

export var articlesCommonData = {
    //文章列表
    articles: [],
    //emoji相关
    emojiList: [],
    emojiListRecentlyUse: [],
    //分页相关
    articlePageNum: 0,
    articlePageSize: 5,
    likePageSize: 5,
    commentPageSize: 5,
    loadMoreView: null,
    //当前选中的文章或评论的id、index
    currentArticleId: 0,
    currentArticleIndex: -1,
    currentCommentId: 0,
    currentCommentIndex: -1,
    //决定某些ui组件是否显示
    showCommentInput: false,
    showCommentContentTool: false,
    showEmojiList: false,
    focusTextarea: false, //决定输入法是否显示
    isPublishByCurrentUser: false, //是否是当前用户所发表的文章，如果是，当用户选中时会显示"回复"和"删除",如果不是，只显示"回复"
    //交互工具相关
    transitionTime: zero_dot_five_second,
    interactToolIndex: -1, //正在显示的交互工具的索引
    //点击评论内容显示的回复删除向导
    commentContentToolTop: 0,
    commentContentToolLeft: 0,
    //其他
    get_articles_url: "",
    commentType: "", //评论类型 有CommentOfArticle(对文章的评论)和ReplyOfComment(对评论的回复)
    toUser: null, //回复评论的对象
    //节流 防止短时间内反复点击评论按钮导致请求的重复发送
    isCreateCommentComplete: true,
    //评论输入相关
    commentValue: "", //当前在评论输入框中输入的评论
    cursorPosition: "", //光标位置 在输入自定义emoji时，光标位置不会改变，仍在最后一个输入的字符后面，要手动改变光标位置到自定义emoji对应的文本后面
    textareaHeight: textarea_one_line_height,
    inputRealHeight: 0, //输入法的真实高度（减去底部tab栏）
    commentInputMainBottom: 0, //评论输入框（除去emoji部分）和页面底部的距离
    inputType: input_text, //决定显示emoji logo 还是键盘logo
    hiddenTransitionMask: true, //是否显示过渡层
    sendCommentButtonStyle: "", //评论发送按钮的样式
    //当前页面向下滑动的距离 
    scrollTop: 0,
    //首次加载相关
    loadingComplete: false,
    isNetworkFault: false,
    isServerFault: false,
    isGetSearchHotspots: false
}

export var articlesCommonMethod = {
    dearlWithArticles(articles) {
        articles.forEach(article => {
            article.createTime = time.timeTransform(article.createTime)
            article.isCurrentUserLike = article.likeDetails.map(likeDetail => likeDetail.user.id).includes(this.data.$state.currentUser.id)
            article.interactContainerWidth = initial_interact_container_width
            article.commentDetails.forEach(commentDetail => {
                    commentDetail.content = emoji.parseEmoji(commentDetail.content)
                    commentDetail.createTime = time.timeTransform(commentDetail.createTime)
                })
                //初始状态 有两种可能 评论数为5条 显示"展开更多评论" 评论数少于5条 直接不渲染评论加载组件 
            article.hasMoreComments = article.commentDetails.length < this.data.pageData.commentPageSize ? false : true
            article.hasMoreLikes = article.likeDetails.length < this.data.pageData.likePageSize ? false : true
                //加载中 显示loading 动画和 “加载中...”
            article.isLoadingComments = false
            article.isLoadingLikes = false
                //加载失败 显示 “加载失败 点击重新加载”
            article.isloadingCommentsFailed = false
                //已经加载第0页， 点击加载后从第一页开始请求
            article.commentPageNum = 1
            article.likePageNum = 1
        })
    },
    decideHeader() {
        let injectedHeader = {}
        switch (this.data.pageData.pageType) {
            case "articles-home-page":
                break
            case "articles-others-posted":
                break
            case "articles-search":
                break
            default:
                injectedHeader = {
                    header: {
                        "Authorization": "Bearer " + tt.getStorageSync('token')
                    }
                }
                break
        }
        return injectedHeader
    },
    getArticles(inputValue) {
        let requestObject = {
            url: this.data.pageData.get_articles_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageData.articlePageNum,
                pageSize: this.data.pageData.articlePageSize
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                    // res.data.code = 503
                if (res.data.code != 200) {
                    this.setData({
                        [`pageData.isServerFault`]: true
                    })
                    return
                }
                this.dearlWithArticles(res.data.data)
                this.setData({
                    [`pageData.articles`]: this.data.pageData.articles.concat(res.data.data),
                }, () => {
                    this.selectComponent("#loadMoreView", (res) => {
                        console.log("selectComponent", res)
                        this.data.pageData.loadMoreView = res
                    })
                })
                if (this.data.pageData.pageType === "articles-home-page") {
                    this.setData({
                        [`pageData.isRefreshing`]: false
                    })
                }
                if (this.data.pageData.pageType === "articles-search") {
                    this.setData({
                        [`pageData.isGetSearchHotspots`]: false
                    })
                }
                if (this.getArticlesSuccessCallBack) this.getArticlesSuccessCallBack()
            },
            fail: () => {
                this.setData({
                    [`pageData.isNetworkFault`]: true
                })
            },
            complete: () => {
                // setTimeout(() => {
                this.setData({
                        [`pageData.loadingComplete`]: true
                    })
                    // }, 300000)
            }
        }
        if (typeof inputValue === 'string' && inputValue != "") {
            Object.assign(requestObject.data, { keyword: inputValue })
        }
        Object.assign(requestObject, this.decideHeader())
        tt.request(requestObject)
    },
    getMoreArticles() {
        let requestObject = {
            url: this.data.pageData.get_articles_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageData.articlePageNum,
                pageSize: this.data.pageData.articlePageSize
            },
            success: (res) => {
                console.log("user-detail article index this", this)
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '操作失败',
                        icon: "none"
                    })
                    this.data.pageData.articlePageNum -= 1
                    this.data.pageData.loadMoreView.loadMoreFail()
                    return
                }
                this.dearlWithArticles(res.data.data)
                this.data.pageData.loadMoreView.loadMoreComplete(res.data.data.length === this.data.pageData.articlePageSize)
                this.setData({
                    [`pageData.articles`]: this.data.pageData.articles.concat(res.data.data)
                })
            },
            fail: (res) => {
                tt.showToast({
                    title: '网络奔溃，操作失败',
                    icon: "none"
                })
                this.data.pageData.articlePageNum -= 1
                this.data.pageData.loadMoreView.loadMoreFail()
            }
        }
        if (this.data.pageData.hasOwnProperty('searchInputValue') && this.data.pageData.searchInputValue != "") {
            Object.assign(requestObject.data, { keyword: this.data.pageData.searchInputValue })
        }
        Object.assign(requestObject, this.decideHeader())
        tt.request(requestObject)
    },
    onLoadCommon(options) {
        //回到初始状态
        this.setData({
            [`pageData.loadingComplete`]: false,
            [`pageData.isNetworkFault`]: false,
            [`pageData.isServerFault`]: false,
        })
        switch (this.data.pageData.pageType) {
            case "articles-home-page":
                this.data.pageData.get_articles_url = base_url + "/article/getHomeRecommendArticles"
                break
            case "articles-others-posted":
                this.data.pageData.get_articles_url = base_url + "/article/getArticlesByUserId/" + options.userId
                break
            case "articles-I-posted":
                this.data.pageData.get_articles_url = base_url + "/article/getArticlesByCurrentUserId"
                break
            case "articles-I-liked":
                this.data.pageData.get_articles_url = base_url + "/article/getArticles/liked"
                break
            case "articles-I-bookmarked":
                this.data.pageData.get_articles_url = base_url + "/article/getArticles/bookmarked"
                break
            case "articles-search":
                this.data.pageData.get_articles_url = base_url + "/esArticle/search"
                break
        }
        //onload时加载emoji列表
        for (let i = 0; i < 78; i++) {
            this.data.pageData.emojiList.push(`/emoji/${i+1}.png`)
        }
        this.data.pageData.emojiListRecentlyUse = tt.getStorageSync('emojiListRecentlyUse').split(";")
        if (this.data.pageData.emojiListRecentlyUse.length === 1 && this.data.pageData.emojiListRecentlyUse[0] === "") {
            this.data.pageData.emojiListRecentlyUse = []
        }
        this.setData({
            [`pageData.emojiList`]: this.data.pageData.emojiList,
            [`pageData.emojiListRecentlyUse`]: this.data.pageData.emojiListRecentlyUse
        })
    },
    firstLoadArticles(inputValue) {
        tt.getNetworkType({
            success: (res) => {
                console.log("network type", res)
                if (res.networkType === "none") {
                    this.setData({
                        [`pageData.loadingComplete`]: true,
                        [`pageData.isNetworkFault`]: true
                    })
                    return
                }
                this.getArticles(inputValue)
            },
            fail: (res) => {
                console.log("get network type failed", res)
                this.getArticles(inputValue)
            }
        })
    },
    onLoad: function(options) {
        this.onLoadCommon(options)
        this.firstLoadArticles()
    },
    onUnload() {
        //unload时保存最近使用的emoji
        let emojiListRecentlyUse = ""
        this.data.pageData.emojiListRecentlyUse.forEach((emoji) => {
            emojiListRecentlyUse += emoji + ";"
        })
        emojiListRecentlyUse.slice(0, emojiListRecentlyUse.length - 1)
        tt.setStorage({
            key: "emojiListRecentlyUse",
            data: emojiListRecentlyUse, // 要缓存的数据
        })
        console.log("unload")
    },
    previewImage(event) {
        let urls = []
        event.currentTarget.dataset.images.forEach((e) => {
            urls.push(e.imageUrl)
        })
        tt.previewImage({
            current: urls[event.currentTarget.dataset.index],
            urls: urls // 图片地址列表
        })
    },
    onTapUnfoldComments(event) {
        console.log("onTapUnfoldComments", event)
        console.log("myRequest", myRequest)
        this.setData({
            [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isLoadingComments`]: true
        })
        myRequest({
            url: get_more_comments_url + "/" + event.currentTarget.dataset.articleId,
            method: 'GET',
            data: {
                pageNum: this.data.pageData.articles[event.currentTarget.dataset.articleIndex].commentPageNum,
                pageSize: this.data.pageData.commentPageSize
            },
            successCallback: (res) => {
                console.log("successCallback", this)
                this.data.pageData.articles[event.currentTarget.dataset.articleIndex].commentPageNum += 1
                res.data.data.forEach(commentDetail => {
                    commentDetail.content = emoji.parseEmoji(commentDetail.content)
                    commentDetail.createTime = time.timeTransform(commentDetail.createTime)
                })
                this.setData({
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].commentDetails]`]: this.data.pageData.articles[event.currentTarget.dataset.articleIndex].commentDetails.concat(res.data.data),
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].hasMoreComments`]: res.data.data.length < this.data.pageData.commentPageSize ? false : true
                })
            },
            fail: () => {
                this.setData({
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isloadMoreCommentsFailed`]: true
                })
            },
            complete: () => {
                // setTimeout(() => {
                this.setData({
                        [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isLoadingComments`]: false
                    })
                    // }, 4000)
            }
        })
    },
    onTapUnfoldLikes(event) {
        console.log("onTapUnfoldLikes", event)
        console.log("myRequest", myRequest)
        this.setData({
            [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isLoadingLikes`]: true
        })
        myRequest({
            url: get_more_likes_url + "/" + event.currentTarget.dataset.articleId,
            method: 'GET',
            data: {
                pageNum: this.data.pageData.articles[event.currentTarget.dataset.articleIndex].likePageNum,
                pageSize: this.data.pageData.likePageSize
            },
            successCallback: (res) => {
                console.log("successCallback", this)
                this.data.pageData.articles[event.currentTarget.dataset.articleIndex].likePageNum += 1
                this.setData({
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].likeDetails]`]: this.data.pageData.articles[event.currentTarget.dataset.articleIndex].likeDetails.concat(res.data.data),
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].hasMoreLikes`]: res.data.data.length < this.data.pageData.likePageSize ? false : true
                })
            },
            fail: () => {
                tt.showToast({
                    title: '加载点赞失败',
                    icon: "none"
                })
            },
            complete: () => {
                // setTimeout(() => {
                this.setData({
                        [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isLoadingLikes`]: false
                    })
                    // }, 40000)
            }
        })
    },
    shrinkAndUnfold(articleIndex) {
        //如果当前文章的交互工具已经收回去，则展开
        if (this.data.pageData.articles[articleIndex].interactContainerWidth === initial_interact_container_width) {
            this.setData({
                [`pageData.articles[${articleIndex}].interactContainerWidth`]: unfold_interact_container_width,
                [`pageData.transitionTime`]: zero_dot_five_second
            }, () => {
                //如果其他文章的交互工具正在显示，则将其收回去
                if (this.data.pageData.interactToolIndex != articleIndex && this.data.pageData.interactToolIndex != -1) {
                    this.setData({
                        [`pageData.articles[${this.data.pageData.interactToolIndex}].interactContainerWidth`]: initial_interact_container_width,
                        [`pageData.transitionTime`]: zero_second
                    })
                }
                //展开后把正在显示的交互工具的索引置为当前文章索引
                this.data.pageData.interactToolIndex = articleIndex
            })
            return
        }
        //如果当前文章的交互工具已经展开，则收回去
        if (this.data.pageData.articles[articleIndex].interactContainerWidth === unfold_interact_container_width) {
            this.setData({
                    [`pageData.articles[${articleIndex}].interactContainerWidth`]: initial_interact_container_width,
                    [`pageData.transitionTime`]: zero_dot_five_second
                })
                //把正在显示的交互工具的索引置空
            this.data.pageData.interactToolIndex = -1
        }
    },
    onTouchMoveContainer() {
        if (this.data.pageData.interactToolIndex != -1) {
            this.setData({
                [`pageData.articles[${this.data.pageData.interactToolIndex}].interactContainerWidth`]: initial_interact_container_width,
                [`pageData.transitionTime`]: zero_second
            })
            this.data.pageData.interactToolIndex = -1
        }
    },
    onTapUnfold(event) {
        this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex)
    },
    onTapLike: function(event) {
        if (this.data.$state.isLogined === false) {
            tt.showToast({
                title: '请先登录',
                icon: "none"
            })
            return
        }
        let requestBody = {
            articleId: event.currentTarget.dataset.articleId,
        }
        tt.request({
            url: create_like_url,
            data: requestBody,
            method: 'POST',
            dataType: 'text',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '点赞失败',
                        icon: "fail"
                    })
                    return
                }
                let likeDetail = {
                    id: res.data.data,
                    user: {
                        id: this.data.$state.currentUser.id,
                        name: this.data.$state.currentUser.name,
                        avatarUrl: this.data.$state.currentUser.avatarUrl
                    }
                }
                this.data.pageData.articles[event.currentTarget.dataset.articleIndex].likeDetails.push(likeDetail)
                this.setData({
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].isCurrentUserLike`]: true,
                    [`pageData.articles[${event.currentTarget.dataset.articleIndex}].likeDetails`]: this.data.pageData.articles[event.currentTarget.dataset.articleIndex].likeDetails,
                    [`pageData.transitionTime`]: zero_second
                })
                setTimeout(this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex), 2000)
            },
            fail(res) {
                tt.showToast({
                    title: '网络奔溃了，点赞失败',
                    icon: "fail"
                })
            }
        })
    },
    onTapDislike: function(event) {
        let articleIndex = event.currentTarget.dataset.articleIndex
        let likeDetails = this.data.pageData.articles[articleIndex].likeDetails
        tt.request({
            url: delete_like_url + "/" + likeDetails.find(e => e.user.id === this.data.$state.currentUser.id).id,
            method: 'DELETE',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '取消赞失败',
                        icon: "fail"
                    })
                    return
                }
                likeDetails.splice(likeDetails.findIndex(e => e.user.id === this.data.$state.currentUser.id), 1)
                this.setData({
                    [`pageData.articles[${articleIndex}].likeDetails`]: likeDetails,
                    [`pageData.articles[${articleIndex}].isCurrentUserLike`]: false,
                    [`pageData.transitionTime`]: zero_second
                })
                setTimeout(this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex), 2000)
            },
            fail: () => {
                tt.showToast({
                    title: '网络奔溃了，取消赞失败',
                    icon: "fail"
                })
            }
        })
    },
    onPageScroll(event) {
        this.data.pageData.scrollTop = event.scrollTop
    },
    onTapCommentTextOrImage: function(event) {
        if (this.data.$state.isLogined === false) {
            tt.showToast({
                title: '请先登录',
                icon: "none"
            })
            return
        }
        this.data.pageData.currentArticleId = event.currentTarget.dataset.articleId
        this.data.pageData.currentArticleIndex = event.currentTarget.dataset.articleIndex
        this.data.pageData.commentType = event.currentTarget.dataset.commentType
            //显示评论组件、设置评论默认值、textarea获取焦点
        console.log("onTapCommentTextOrImage pageData", this.data.pageData)
        this.setData({
                [`pageData.showCommentInput`]: true,
                [`pageData.commentValue`]: this.data.pageData.commentValue,
                [`pageData.transitionTime`]: zero_second,
                [`pageData.focusTextarea`]: false
            }, () => {
                this.setData({
                    [`pageData.focusTextarea`]: true,
                })
            })
            //设置发送按钮样式
        if (this.data.pageData.commentValue === "") {
            this.setData({
                [`pageData.sendCommentButtonStyle`]: "background-color: #cccccc;"
            })
        } else {
            this.setData({
                [`pageData.sendCommentButtonStyle`]: "background-color: #36ee25e8;"
            })
        }
        setTimeout(this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex), 2000)
    },
    onFocusTextarea(event) {
        let systemInfo = wx.getSystemInfoSync()
            //减去tab栏的高度
            // this.data.pageData.inputRealHeight = 250
        this.data.pageData.inputRealHeight = event.detail.height - (systemInfo.screenHeight - systemInfo.statusBarHeight - 44 - systemInfo.windowHeight)
        tt.createSelectorQuery().select("#comment" + "-" + this.data.pageData.currentArticleIndex + "-" + (this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.length - 1)).
        boundingClientRect().exec(res => {
            console.log(this.data.pageData.currentArticleIndex, this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.length - 1)
            console.log("last comment position", res, "scroll-top", this.data.pageData.scrollTop)
            if (res != null) {
                //页面滚动到最后一条评论处
                tt.pageScrollTo({
                    scrollTop: res[0].bottom + this.data.pageData.scrollTop - (systemInfo.windowHeight - this.data.pageData.inputRealHeight - 25 - 50)
                })
            }
        })
        this.setData({
            [`pageData.focusTextarea`]: true, //focusTextarea的值和ui的表现一致，点击输入框获取焦点时，focusTextarea的值也得设置为true，否则ui会错乱
            [`pageData.showEmojiList`]: false, //获取焦点时，要输入文字，隐藏emoji列表
            [`pageData.hiddenTransitionMask`]: false, //显示过渡层
            [`pageData.inputRealHeight`]: this.data.pageData.inputRealHeight, //设置过渡层的高度
            [`pageData.commentInputMainBottom`]: this.data.pageData.inputRealHeight, //把输入框底部和页面底部的距离设置为输入法的真实高度
            [`pageData.inputType`]: input_text, //输入框右边的图标显示为键盘图标
        })
    },
    onBlur(event) {
        console.log("blur event", event)
            //失去焦点 隐藏评论输入组件
            //但点击emoji-logo手动失去焦点时，直接返回，因为要看到emoji列表，不是让整个评论输入组件消失
        if (this.data.pageData.inputType === input_emoji) return
        this.setData({
            [`pageData.showCommentInput`]: false,
        })
    },
    onInputComment: function(event) {
        console.log("input comment", event.detail.value)
            //不能用下面的 否则只改变js层的值，ui层的值不发生改变，textarea置空会失效
            //（setData时，ui层会对比当前的值和原始值，不同才会更新ui,而置空textarea时，要设置的值和原始值都为空)
            // this.data.pageData.commentValue = event.detail.value
        this.setData({
            [`pageData.commentValue`]: event.detail.value
        })
        if (this.data.pageData.commentValue == "") {
            this.setData({
                [`pageData.sendCommentButtonStyle`]: "background-color: #cccccc;"
            })
            return
        } else {
            this.setData({
                [`pageData.sendCommentButtonStyle`]: "background-color: #36ee25e8;"
            })
        }
        let returnNum = string.findNum(event.detail.value, "\n")
        if (returnNum === 0) {
            this.setData({
                [`pageData.textareaHeight`]: textarea_one_line_height
            })
        }
        if (returnNum === 1) {
            this.setData({
                [`pageData.textareaHeight`]: textarea_two_line_height
            })
        }
        if (returnNum >= 2) {
            this.setData({
                [`pageData.textareaHeight`]: textarea_three_line_height
            })
        }
    },
    onTapEmojiLogo: function(event) {
        console.log("onTapEmojiLogo", event)
        this.data.pageData.inputType = input_emoji
        tt.showToast({
            title: `${this.data.pageData.focusTextarea}`
        })
        this.setData({
            //显示emoji列表
            [`pageData.showEmojiList`]: true,
            [`pageData.emojiListRecentlyUse`]: this.data.pageData.emojiListRecentlyUse,
            //指定emoji列表的高度为键盘真是真实高度
            [`pageData.inputRealHeight`]: this.data.pageData.inputRealHeight,
            //让发送按钮左边的图片变为emoji-logo
            [`pageData.inputType`]: input_emoji,
            //手动让text-area失去焦点，这样键盘就能下滑，否则键盘会没有反应，遮盖在emoji列表上面（因为hold-keyboard为true）
            [`pageData.focusTextarea`]: false
        })
    },
    onTapKeyboardLogo() {
        this.setData({
            //点击键盘logo时,要输入文字，隐藏emoji列表
            [`pageData.showEmojiList`]: false,
            [`pageData.inputType`]: input_text,
            //重新获取焦点
            [`pageData.focusTextarea`]: false,
        }, () => {
            this.setData({
                [`pageData.focusTextarea`]: true
            })
        })
    },
    onTapEmojiItem: function(event) {
        console.log("onTapEmojiItem", event)
        this.data.pageData.emojiListRecentlyUse.remove(event.target.dataset.emojiItem)
        this.data.pageData.emojiListRecentlyUse.unshift(event.target.dataset.emojiItem)
        if (this.data.pageData.emojiListRecentlyUse.length === 9) this.data.pageData.emojiListRecentlyUse.pop()
        this.setData({
            [`pageData.commentValue`]: this.data.pageData.commentValue + Object.keys(emoji.emojiMap).find((key) => { return emoji.emojiMap[key] === event.target.dataset.emojiItem }),
            [`pageData.sendCommentButtonStyle`]: "background-color: #36ee25e8;",
            [`pageData.cursorPosition`]: this.data.pageData.commentValue.length + 4
        })
    },
    onTapCommentSendButton: function(event) {
        //节流 防止短时间内反复的点击导致相同的评论重复创建
        if (this.data.pageData.isCreateCommentComplete === false || this.data.pageData.commentValue === "") {
            console.log("评论创建未完成")
            return
        }
        this.data.pageData.isCreateCommentComplete = false
        console.log(event)
        let requestBody = null
        if (this.data.pageData.commentType === "CommentOfArticle") {
            requestBody = {
                articleId: this.data.pageData.currentArticleId,
                content: this.data.pageData.commentValue,
                createTime: new Date()
            }
        }
        if (this.data.pageData.commentType === "ReplyOfComment") {
            console.log(this.data.pageData.toUser)
            requestBody = {
                articleId: this.data.pageData.currentArticleId,
                content: this.data.pageData.commentValue,
                toUserId: this.data.pageData.toUser.id,
                createTime: new Date()
            }
        }
        tt.request({
            url: create_comment_url,
            data: requestBody,
            method: 'POST',
            dataType: 'text',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '发布评论失败',
                        icon: "fail"
                    })
                    return
                }
                if (this.data.pageData.commentType === "CommentOfArticle") {
                    this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.push({
                        id: res.data.data,
                        content: emoji.parseEmoji(this.data.pageData.commentValue),
                        createTime: time.timeTransform(new Date().toString()),
                        fromUser: this.data.$state.currentUser
                    })
                }
                if (this.data.pageData.commentType === "ReplyOfComment") {
                    this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.push({
                        id: res.data.data,
                        content: emoji.parseEmoji(this.data.pageData.commentValue),
                        createTime: time.timeTransform(new Date().toString()),
                        fromUser: this.data.$state.currentUser,
                        toUser: this.data.pageData.toUser
                    })
                }
                console.log(this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails)
                this.setData({
                    [`pageData.articles[${this.data.pageData.currentArticleIndex}].commentDetails`]: this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails,
                    [`pageData.showCommentInput`]: false,
                    //评论输入组件状态还原
                    [`pageData.commentValue`]: "",
                    [`pageData.textareaHeight`]: textarea_one_line_height,
                    [`pageData.inputType`]: input_text
                })
            },
            fail: () => {
                tt.showToast({
                    title: '网络奔溃，发布评论失败',
                    icon: "fail"
                })
            },
            complete: () => {
                console.log("send comment complete")
                this.data.pageData.isCreateCommentComplete = true
            }
        })
    },
    onTapCommentContent: function(event) {
        console.log("tapCommentContent", event)
        if (this.data.$state.isLogined === false) return
        this.data.pageData.currentCommentId = event.currentTarget.dataset.commentId
        this.data.pageData.currentCommentIndex = event.currentTarget.dataset.commentIndex
        this.data.pageData.currentArticleIndex = event.currentTarget.dataset.articleIndex
        this.data.pageData.currentArticleId = event.currentTarget.dataset.articleId
        this.data.pageData.toUser = event.currentTarget.dataset.fromUser
        if (event.currentTarget.dataset.fromUser.id === this.data.$state.currentUser.id) {
            this.data.pageData.isPublishByCurrentUser = true
        } else {
            this.data.pageData.isPublishByCurrentUser = false
        }
        this.setData({
            [`pageData.showCommentContentTool`]: !this.data.pageData.showCommentContentTool,
            [`pageData.isPublishByCurrentUser`]: this.data.pageData.isPublishByCurrentUser,
            [`pageData.commentContentToolLeft`]: event.changedTouches[0].clientX,
            [`pageData.commentContentToolTop`]: event.changedTouches[0].clientY
        })
    },
    onTouchStartContainer() {
        if (this.data.pageData.showCommentContentTool === true) {
            this.setData({
                [`pageData.showCommentContentTool`]: false,
            })
        }
    },
    onTapReply: function(event) {
        this.data.pageData.commentType = event.currentTarget.dataset.commentType
        this.setData({
            [`pageData.showCommentInput`]: true
        })
    },
    onTapCommentDelete: function(event) {
        console.log(event)
        tt.request({
            url: delete_comment_url + "/" + this.data.pageData.currentCommentId,
            method: 'DELETE',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '删除评论失败',
                        icon: "fail"
                    })
                    return
                }
                this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.splice(this.data.pageData.currentCommentIndex, 1)
                this.setData({
                    [`pageData.articles[${this.data.pageData.currentArticleIndex}].commentDetails`]: this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails
                })
            },
            fail: (err) => {
                tt.showToast({
                    title: '网络崩溃，删除评论失败',
                    icon: "fail"
                })
            }
        })
    },
    onTapContainer: function(event) {
        console.log("tapContainer", event)
        let inScrollView = false
        let inCommentInputMain = false
            //判断是否在scroll-view里面
        tt.createSelectorQuery().select("#scroll-view").boundingClientRect().exec(res => {
            console.log("res", res)
            if (res[0] != null && position.checkPointInRectangle(event.touches[0], res[0]) === true) {
                inScrollView = true
            }
            //判断是否在comment-input-main里面
            tt.createSelectorQuery().select("#comment-input-main").boundingClientRect().exec(res => {
                console.log("res", res)
                if (res[0] != null && position.checkPointInRectangle(event.touches[0], res[0]) === true) {
                    inCommentInputMain = true
                }
                //都不在，取消展示评论输入组件
                if (!inScrollView && !inCommentInputMain) {
                    this.setData({
                        [`pageData.showCommentInput`]: false,
                        [`pageData.showEmojiList`]: false
                    })
                }
            })
        })
        console.log(this.data.pageData.showCommentInput)
    },
    onReachBottom() {
        console.log("reach bottom")
        this.data.pageData.loadMoreView.loadMore()
    },
    loadMoreListener: function(e) {
        this.data.pageData.articlePageNum += 1
        this.getMoreArticles()
    },
    clickLoadMore: function(e) {
        this.loadMoreListener()
    },
}