import { base_url } from '../config.js'
import { solvelong } from 'solvelong.js'
var time = require('time.js')
var string = require('string.js')
var position = require('position.js')
var emoji = require('emoji.js')

const create_like_url = base_url + "/like/create"
const delete_like_url = base_url + "/like/delete"
const create_comment_url = base_url + "/comment/create"
const delete_comment_url = base_url + "/comment/delete"

const initial_interact_container_width = "0rpx"
const unfold_interact_container_width = "280rpx"
const font_size = 32
const textarea_one_line_height = font_size
const textarea_two_line_height = textarea_one_line_height + font_size
const textarea_three_line_height = textarea_two_line_height + 1.5 * font_size
const zero_dot_five_second = "0.5s"
const zero_second = "0s"
const page_size = 5
const input_text = "input-text"
const input_emoji = "input-emoji"

export var articlesCommonData = {
    //基本信息 包括文章列表,emoji列表，最近使用的emoji列表
    articles: [],
    emojiList: [],
    emojiListRecentlyUse: [],
    //分页相关
    pageNum: 1,
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
    //决定这些ui组件的显示方式
    transitionTime: zero_dot_five_second,
    commentInputMainBottom: 0,
    commentContentToolTop: 0,
    commentContentToolLeft: 0,
    textareaHeight: textarea_one_line_height,
    //其他
    interactToolIndex: -1, //正在显示的交互工具的索引
    commentType: "", //评论类型 有CommentOfArticle(对文章的评论)和ReplyOfComment(对评论的回复)
    commentValue: "", //当前在评论输入框中输入的评论
    toUser: null, //回复评论的对象
    //节流
    isCreateCommentComplete: true,
    get_articles_url: "",
    //输入法高度
    inputRealHeight: 0,
    inputType: input_text,
    hiddenTransitionMask: true,
    sendCommentButtonStyle: "",
    scrollTop: 0
}
export var articlesCommonMethod = {
    getArticles() {
        let requestObject = {
            url: this.data.pageData.get_articles_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageData.pageNum,
                pageSize: 5
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) return
                console.log("state ", this.data.$state)
                res.data.data.forEach(article => {
                    article.createTime = time.timeTransform(article.createTime)
                    article.isCurrentUserLike = article.likeDetails.map(likeDetail => likeDetail.user.id).includes(this.data.$state.currentUser.id)
                        // article.likeUserIds = article.likeDetails.map(likeDetail => likeDetail.user.id)
                    article.interactContainerWidth = initial_interact_container_width
                    article.commentDetails.forEach(commentDetail => {
                        commentDetail.content = emoji.parseEmoji(commentDetail.content)
                        commentDetail.createTime = time.timeTransform(commentDetail.createTime)
                    })
                })
                console.log(res.data.data, this.data.pageData.emojiList)
                this.setData({
                    [`pageData.articles`]: this.data.pageData.articles.concat(res.data.data),
                })
                if (this.data.pageData.pageType === "articles-home-page") {
                    this.setData({
                        [`pageData.isRefreshing`]: false
                    })
                }
                if (this.getArticlesSuccessCallBack) this.getArticlesSuccessCallBack()
            },
            fail: (err) => {
                console.log("get articles failed", err)
                tt.showToast({
                    title: '获取文章失败',
                    icon: "none"
                })
            }
        }
        let injectedHeader = {}
        switch (this.data.pageData.pageType) {
            case "articles-home-page":
                break
            case "articles-others-posted":
                break
            default:
                injectedHeader = {
                    header: {
                        "Authorization": "Bearer " + tt.getStorageSync('token')
                    }
                }
                break
        }
        console.log("injected header xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", injectedHeader)
        Object.assign(requestObject, injectedHeader)
        tt.request(requestObject)
    },
    getMoreArticles() {
        let requestObject = {
            url: this.data.pageData.get_articles_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageData.pageNum,
                pageSize: page_size
            },
            success: (res) => {
                console.log("user-detail article index this", this)
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    this.data.pageData.pageNum -= 1
                    this.data.pageData.loadMoreView.loadMoreFail()
                    return
                }
                this.data.pageData.loadMoreView.loadMoreComplete(res.data.data.length === page_size)
                console.log("state ", this.data.$state)
                res.data.data.forEach(article => {
                    article.createTime = time.timeTransform(article.createTime)
                    article.isCurrentUserLike = article.likeDetails.map(likeDetail => likeDetail.user.id).includes(this.data.$state.currentUser.id)
                    article.interactContainerWidth = initial_interact_container_width
                    article.commentDetails.forEach(commentDetail => {
                        commentDetail.content = emoji.parseEmoji(commentDetail.content)
                        commentDetail.createTime = time.timeTransform(commentDetail.createTime)
                    })
                })
                console.log(res.data.data, this.data.pageData.emojiList)
                this.setData({
                    [`pageData.articles`]: this.data.pageData.articles.concat(res.data.data)
                })
            },
            fail: (res) => {
                this.data.pageData.pageNum -= 1
                this.data.pageData.loadMoreView.loadMoreFail()
            }
        }
        let injectedHeader = {}
        switch (this.data.pageData.pageType) {
            case "articles-home-page":
                break
            case "articles-others-posted":
                break
            default:
                injectedHeader = {
                    header: {
                        "Authorization": "Bearer " + tt.getStorageSync('token')
                    }
                }
                break
        }
        Object.assign(requestObject, injectedHeader)
        tt.request(requestObject)
    },
    onLoad: function(options) {
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
        }
        const list = []
        for (let i = 0; i < 78; i++) {
            list.push(`/emoji/${i+1}.png`)
        }
        this.setData({
            [`pageData.emojiList`]: list,
            [`pageData.emojiListRecentlyUse`]: list.slice(0, 5)
        })
        this.getArticles()
    },
    onUnload() {
        console.log("unload")
    },
    onReady() {
        this.selectComponent("#loadMoreView", (res) => {
            console.log("selectComponent", res)
            this.data.pageData.loadMoreView = res
        })
    },
    previewImage(event) {
        let urls = []
        event.currentTarget.dataset.images.forEach(e => {
            urls.push(e.imageUrl)
        })
        tt.previewImage({
            current: urls[event.currentTarget.dataset.index],
            urls: urls // 图片地址列表
        })
    },
    shrinkAndUnfold(articleIndex) {
        //如果当前文章的交互工具已经收回去，则展开
        if (this.data.pageData.articles[articleIndex].interactContainerWidth === initial_interact_container_width) {
            this.setData({
                    [`pageData.articles[${articleIndex}].interactContainerWidth`]: unfold_interact_container_width
                })
                //如果其他文章的交互工具正在显示，则将其收回去
            if (this.data.pageData.interactToolIndex != articleIndex && this.data.pageData.interactToolIndex != -1) {
                this.setData({
                    [`pageData.articles[${this.data.pageData.interactToolIndex}].interactContainerWidth`]: initial_interact_container_width
                })
            }
            //展开后把正在显示的交互工具的索引置为当前文章索引
            this.data.pageData.interactToolIndex = articleIndex
            return
        }
        //如果当前文章的交互工具已经展开，则收回去
        if (this.data.pageData.articles[articleIndex].interactContainerWidth === unfold_interact_container_width) {
            this.setData({
                    [`pageData.articles[${articleIndex}].interactContainerWidth`]: initial_interact_container_width
                })
                //把正在显示的交互工具的索引置空
            this.data.pageData.interactToolIndex = -1
        }
    },
    onTapUnfold(event) {
        this.setData({
            [`pageData.transitionTime`]: zero_dot_five_second
        })
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
        console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", this.data.pageData)
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
                tt.pageScrollTo({
                    scrollTop: res[0].bottom + this.data.pageData.scrollTop - (systemInfo.windowHeight - this.data.pageData.inputRealHeight - 25 - 50)
                })
            }
        })
        this.setData({
            [`pageData.commentInputMainBottom`]: this.data.pageData.inputRealHeight,
            [`pageData.inputRealHeight`]: this.data.pageData.inputRealHeight,
            [`pageData.hiddenTransitionMask`]: false,
            [`pageData.inputType`]: input_text
        })
    },
    onBlur(event) {
        console.log("blur event", event)
            //点击emoji-logo手动失去焦点时，直接返回，因为要看到emoji列表，不是让整个评论输入模块消失
        if (this.data.pageData.inputType === input_emoji) return
            // this.setData({
            //     [`pageData.showEmojiList`]: false,
            //     [`pageData.hiddenTransitionMask`]: true,
            //     [`pageData.commentInputMainBottom`]: 0
            // })
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
        this.setData({
            //显示emoji列表
            [`pageData.showEmojiList`]: true,
            //指定emoji列表的高度为键盘真是高度
            [`pageData.inputRealHeight`]: this.data.pageData.inputRealHeight,
            //让发送按钮左边的图片变为emoji-logo
            [`pageData.inputType`]: input_emoji,
            //手动让text-area失去焦点，这样键盘就能下滑，否则键盘会没有反应，遮盖在emoji列表上面（因为hold-keyboard为true）
            [`pageData.focusTextarea`]: false
        })
    },
    onTapKeyboardLogo() {
        this.setData({
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
        console.log(event)
        this.setData({
            [`pageData.commentValue`]: this.data.pageData.commentValue + Object.keys(emoji.emojiMap)[event.target.dataset.emojiIndex],
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
                    [`pageData.commentValue`]: ""
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
        if (this.data.pageData.showCommentContentTool === true) {
            this.setData({
                [`pageData.showCommentContentTool`]: false,
            })
        }
    },
    onReachBottom() {
        console.log("reach bottom")
        this.data.pageData.loadMoreView.loadMore()
    },
    loadMoreListener: function(e) {
        this.data.pageData.pageNum += 1
        this.getMoreArticles()
    },
    clickLoadMore: function(e) {
        this.loadMoreListener()
    },
}