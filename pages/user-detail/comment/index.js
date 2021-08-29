import { solvelong } from '../../../common/solvelong'
import { timeTransform } from '../../../common/time'
import { parseEmoji } from '../../../common/emoji'
import { base_url } from '../../../config'

var get_comment_url = base_url + "/comment/getByUserId"
var delete_comments_url = base_url + "/comment/delete/batch"
var delete_all_comments_url = base_url + "/comment/delete/all"

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i
    }
    return -1
}
Array.prototype.remove = function(val) {
    var index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}

Page({
    useStore: true,
    data: {
        comments: [],
        loadMoreView: null,
        pageNum: 1,
        pageSize: 10,
        isEditing: false,
        commentLeftWidth: "5%",
        commentRightWidth: "95%",
        editButtonBackgroundColor: "rgb(0, 153, 255)",
        selectedCommentIndices: [],
        selectedCommentIds: [],
        deleteTextColor: "#cccccc",
        isDeletePart: false,
        isDeleteAll: false,
        loadingComplete: false,
        isfirstLoadFailed: false
    },
    onLoad() {
        console.log("comments load")
        tt.getNetworkType({
            success: (res) => {
                console.log("network type", res)
                if (res.networkType === "none") {
                    this.setData({
                        loadingComplete: true,
                        isfirstLoadFailed: true
                    })
                    return
                }
                this.getComments()
            },
            fail: (res) => {
                console.log("get network type failed", res)
                this.getComments()
            }
        })
    },
    getComments() {
        tt.request({
            url: get_comment_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageNum,
                pageSize: this.data.pageSize
            },
            header: {
                "content-type": "application/json",
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '操作失败',
                        icon: "none"
                    })
                    return
                }
                res.data.data.forEach((comment) => {
                    comment.showHook = false
                    comment.selectButtonBackgroundColor = "#cccccc"
                    comment.createTime = timeTransform(comment.createTime)
                    comment.content = parseEmoji(comment.content)
                })
                this.setData({
                    comments: res.data.data
                }, () => {
                    this.selectComponent("#loadMoreView", (res) => {
                        console.log("selectComponent", res)
                        this.data.loadMoreView = res
                    })
                })
            },
            fail: () => {
                this.setData({
                    isfirstLoadFailed: true
                })
            },
            complete: () => {
                // setTimeout(() => {
                this.setData({
                        loadingComplete: true
                    })
                    // }, 40000)
            }
        })
    },
    getMoreComments() {
        tt.request({
            url: get_comment_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageNum,
                pageSize: this.data.pageSize
            },
            header: {
                "content-type": "application/json",
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '操作失败',
                        icon: "none"
                    })
                    this.data.pageNum -= 1
                    this.data.loadMoreView.loadMoreFail()
                    return
                }
                res.data.data.forEach((comment) => {
                    comment.showHook = false
                    comment.selectButtonBackgroundColor = "#cccccc"
                    comment.createTime = timeTransform(comment.createTime)
                    comment.content = parseEmoji(comment.content)
                })
                this.setData({
                    comments: this.data.comments.concat(res.data.data)
                })
                this.data.loadMoreView.loadMoreComplete(res.data.data.length === this.data.pageSize)
            },
            fail: (res) => {
                tt.showToast({
                    title: '网络奔溃，操作失败',
                    icon: 'none'
                })
                this.data.pageNum -= 1
                this.data.loadMoreView.loadMoreFail()
            }
        })
    },
    onTapEdit() {
        if (this.data.isEditing === true) {
            this.data.selectedCommentIds = []
            this.data.selectedCommentIndices.forEach((index) => {
                this.data.comments[index].selectButtonBackgroundColor = "#cccccc"
                this.data.comments[index].showHook = false
            })
            this.setData({
                comments: this.data.comments,
                commentLeftWidth: "5%",
                commentRightWidth: "95%",
                editButtonBackgroundColor: "rgb(0, 153, 255)",
                deleteTextColor: "#cccccc",
                selectedCommentIndices: []
            })
        } else {
            this.setData({
                commentLeftWidth: "15%",
                commentRightWidth: "85%",
                editButtonBackgroundColor: "#cccccc"
            })
        }
        this.setData({
            isEditing: !this.data.isEditing
        })
    },
    onTapChoose(event) {
        console.log("onTapChoose", event)
        if (this.data.comments[event.currentTarget.dataset.commentIndex].showHook === false) {
            this.data.selectedCommentIndices.push(event.currentTarget.dataset.commentIndex)
            this.data.selectedCommentIds.push(event.currentTarget.dataset.commentId)
            this.setData({
                [`comments[${event.currentTarget.dataset.commentIndex}].selectButtonBackgroundColor`]: "rgb(0, 153, 255)",
            })
        } else {
            this.data.selectedCommentIndices.remove(event.currentTarget.dataset.commentIndex)
            this.data.selectedCommentIds.remove(event.currentTarget.dataset.commentId)
            this.setData({
                [`comments[${event.currentTarget.dataset.commentIndex}].selectButtonBackgroundColor`]: "#cccccc"
            })
        }
        this.setData({
            [`comments[${event.currentTarget.dataset.commentIndex}].showHook`]: !this.data.comments[event.currentTarget.dataset.commentIndex].showHook,
            selectedCommentIndices: this.data.selectedCommentIndices
        })
        if (this.data.selectedCommentIndices.length === 0) {
            this.setData({
                deleteTextColor: "#cccccc"
            })
        } else {
            this.setData({
                deleteTextColor: "rgb(0, 153, 255)"
            })
        }
    },
    onTapDeletePart(event) {
        console.log("ontapDeletePart", event, this.data.selectedCommentIds, this.data.selectedCommentIndices)
        if (this.data.selectedCommentIndices.length === 0) return
        this.setData({
            isDeletePart: true
        })
    },
    onCancelDeletePart() {
        this.setData({
            isDeletePart: false
        })
    },
    onConfirmDeletePart() {
        console.log("onConfirmDeletePart")
        this.setData({
            isDeletePart: false
        })
        return
        tt.request({
            url: delete_comments_url,
            method: 'DELETE',
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            data: this.data.selectedCommentIds,
            success: (res) => {
                console.log("delete comments succeed", res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '操作失败',
                        icon: "none"
                    })
                    return
                }
                this.data.selectedCommentIndices.forEach((index) => {
                    this.data.comments.splice(index, 1)
                })
                this.data.selectedCommentIndices = []
                this.onTapEdit()
            },
            fail(res) {
                tt.showToast({
                    title: '网络奔溃，操作失败',
                    icon: 'none'
                })
            }
        })
    },
    onTapDeleteAll() {
        console.log("onTapDeleteAll")
        this.data.comments.forEach((comment) => {
            comment.showHook = true
            comment.selectButtonBackgroundColor = "rgb(0, 153, 255)"
        })
        this.setData({
            comments: this.data.comments,
            isDeleteAll: true
        })
    },
    onCancelDeleteAll() {
        this.data.comments.forEach((comment) => {
            comment.showHook = false
            comment.selectButtonBackgroundColor = "#cccccc"
        })
        this.data.selectedCommentIds = []
        this.setData({
            comments: this.data.comments,
            selectedCommentIndices: [],
            isDeleteAll: false
        })
    },
    onConfirmDeleteAll() {
        console.log("onConfirmDeleteAll")
            //删除可能需要一段时间 这里直接取消confirm-delete组件显示, 不写在complete里面
        this.setData({
            isDeleteAll: false
        })
        return
        tt.request({
            url: delete_all_comments_url,
            method: 'DELETE',
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                console.log("delete all comments succeed", res.data)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '操作失败',
                        icon: "none"
                    })
                    return
                }
                this.data.comments = []
                this.data.selectedCommentIndices = []
                this.onTapEdit()
            },
            fail(res) {
                tt.showToast({
                    title: '网络奔溃，操作失败',
                    icon: 'none'
                })
            }
        })
    },
    onTapLogin: function(e) {
        tt.navigateTo({
            url: '/pages/login/index?pageIndex=' + '/pages/user-detail/comment/index'
        })
    },
    onReachBottom() {
        console.log("reach bottom")
        this.data.loadMoreView.loadMore()
    },
    loadMoreListener: function(e) {
        this.data.pageNum += 1
        this.getMoreComments()
    },
    clickLoadMore: function(e) {
        this.loadMoreListener()
    }
})