var time = require('../../../common/time')
var string = require('../../../common/string')
var position = require('../../../common/position')
var emoji = require('../../../common/emoji')

const app = getApp();

var get_articles_url = app.data.base_url + "/article/getArticles/bookmarked"
var create_like_url = app.data.base_url + "/like/create"
var delete_like_url = app.data.base_url + "/like/delete"
var create_comment_url = app.data.base_url + "/comment/create"
var delete_comment_url = app.data.base_url + "/comment/delete"

var initial_interact_container_width = "0rpx"
var unfold_interact_container_width = "280rpx"
var font_size = 32
var textarea_one_line_height = font_size
var textarea_two_line_height = textarea_one_line_height + font_size
var textarea_three_line_height = textarea_two_line_height + 1.5 * font_size
var zero_dot_five_second = "0.5s"
var zero_second = "0s"
var page_size = 5

Page({
    useStore: true,
    data: {
        pageData: {
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
            showInput: true,
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
        }
    },
    binderror(err) {
        console.log('图片加载失败', err);
    },
    bindload(e) {
        console.log('图片加载成功', e);
    },
    onLoad: function(options) {
        const list = []
        for (let i = 0; i < 78; i++) {
            list.push(`/emoji/${i+1}.png`);
        }
        this.setData({
            [`pageData.emojiList`]: list,
            [`pageData.emojiListRecentlyUse`]: list.slice(0, 5)
        })
        this.getArticles()
    },
    getArticles() {
        tt.request({
            url: get_articles_url,
            method: 'GET',
            data: {
                pageNum: this.data.pageData.pageNum,
                pageSize: 5
            },
            header: {
                "content-type": "application/json",
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) return
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
                    [`pageData.articles`]: res.data.data
                })
            },
            fail(res) {}
        })
    },
    getMoreArticles() {
        tt.request({
            url: get_articles_url,
            method: 'GET',
            data: {
                pageNum: this.data.pageData.pageNum,
                pageSize: page_size
            },
            header: {
                "content-type": "application/json",
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                console.log("user-detail article index this", this)
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
        })
    },
    onReady: function() {
        this.selectComponent("#loadMoreView", (res) => {
            console.log("selectComponent", res)
            this.data.pageData.loadMoreView = res
        })
    },
    previewImage: function(event) {
        let urls = []
        event.currentTarget.dataset.images.forEach(e => {
            urls.push(e.imageUrl)
        })
        tt.previewImage({
            current: urls[event.currentTarget.dataset.index],
            urls: urls, // 图片地址列表
            success: (res) => {

            },
            fail: (res) => {}
        });
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
    onTapUnfold: function(event) {
        this.setData({
            [`pageData.transitionTime`]: zero_dot_five_second
        })
        this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex)
    },
    // 触发点赞
    onTapLike: function(event) {
        let requestBody = {
            articleId: event.currentTarget.dataset.articleId,
        }
        tt.request({
            url: create_like_url,
            data: requestBody,
            method: 'POST',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) {
                    if (res.data.code === 401) {
                        tt.showToast({
                            title: '请先登录',
                        })
                    }
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
                    if (res.data.code === 401) {
                        tt.showToast({
                            title: '请先登录',
                        })
                    }
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
            fail(res) {}
        })
    },
    onbindInput: function(event) {
        console.log(event)
        this.data.pageData.commentValue = event.detail.value
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
    onTapComment: function(event) {
        this.data.pageData.currentArticleId = event.currentTarget.dataset.articleId
        this.data.pageData.currentArticleIndex = event.currentTarget.dataset.articleIndex
        this.data.pageData.commentType = event.currentTarget.dataset.commentType
        this.setData({
            [`pageData.showCommentInput`]: true,
            [`pageData.commentValue`]: this.data.pageData.commentValue,
            [`pageData.transitionTime`]: zero_second
        })
        setTimeout(this.shrinkAndUnfold(event.currentTarget.dataset.articleIndex), 2000)
    },
    onTapCommentContent: function(event) {
        console.log("tapCommentContent", event)
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
    onTouchStartCommentContent: function(event) {},
    onTapReply: function(event) {
        this.data.pageData.showCommentInput = true
        this.data.pageData.commentType = event.currentTarget.dataset.commentType
        this.setData({
            [`pageData.showCommentInput`]: this.data.pageData.showCommentInput
        })
    },
    onTapEmoji: function(event) {

    },
    onTapCommentSendButton: function(event) {
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
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) {
                    if (res.data.code === 401) {
                        tt.showToast({
                            title: '请先登录',
                        })
                    }
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
                    [`pageData.showCommentInput`]: false
                })
                this.data.pageData.commentValue = ""
            },
            fail(res) {}
        })
    },
    onTapEmojiLogo: function(event) {
        console.log("onTapEmojiLogo", event)
        this.setData({
            [`pageData.showInput`]: !this.data.pageData.showInput
        })
        if (this.data.pageData.showInput === true) {
            this.setData({
                [`pageData.commentInputMainBottom`]: 0,
                [`pageData.showEmojiList`]: !this.data.pageData.showInput,
            })
        } else {
            this.setData({
                [`pageData.commentInputMainBottom`]: 13,
                [`pageData.showEmojiList`]: !this.data.pageData.showInput,
            })
        }
    },
    onTapEmojiItem: function(event) {
        console.log(event)
        this.setData({
            [`pageData.commentValue`]: this.data.pageData.commentValue + Object.keys(emoji.emojiMap)[event.target.dataset.emojiIndex],
        })
    },
    onTapContainer: function(event) {
        console.log("tapContainer", event)
        let inScrollView = false
        let inCommentInputMain = false
        tt.createSelectorQuery().select("#scroll-view").boundingClientRect().exec(res => {
                console.log("res", res)
                if (res[0] != null && position.checkPointInRectangle(event.touches[0], res[0]) === true) {
                    inScrollView = true
                }
                tt.createSelectorQuery().select("#comment-input-main").boundingClientRect().exec(res => {
                    console.log("res", res)
                    if (res[0] != null && position.checkPointInRectangle(event.touches[0], res[0]) === true) {
                        inCommentInputMain = true
                    }
                    if (!inScrollView && !inCommentInputMain) {
                        this.setData({
                            [`pageData.showCommentInput`]: false,
                        })
                    }
                })
            })
            // if(this.data.pageData.showCommentInput === true){
            //   this.setData({
            //     [`pageData.showCommentInput`]: false,
            //   })
            // }
        console.log(this.data.pageData.showCommentInput)
        if (this.data.pageData.showCommentContentTool === true) {
            this.setData({
                [`pageData.showCommentContentTool`]: false,
            })
        }
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
                    if (res.data.code === 401) {
                        tt.showToast({
                            title: '请先登录',
                        })
                    }
                    return
                }
                this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails.splice(this.data.pageData.currentCommentIndex, 1)
                this.setData({
                    [`pageData.articles[${this.data.pageData.currentArticleIndex}].commentDetails`]: this.data.pageData.articles[this.data.pageData.currentArticleIndex].commentDetails
                })
            },
            fail(res) {}
        })
    },
    onTapLogin: function(e) {
        tt.navigateTo({
            url: '/pages/login/index?pageIndex' + '/pages/user-detail/bookmark/index'
        })
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
    }
});