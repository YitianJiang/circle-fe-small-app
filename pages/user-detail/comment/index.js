import { solvelong } from '../../../common/solvelong.js'

var app = getApp()
var get_comment_url = app.data.base_url + "/comment/get"
var delete_comment_url = app.data.base_url + "/comment/delete/"
var page_size = 10

Page({
    useStore: true,
    data: {
        comments: [],
        isLogined: app.isLogined,
        loadMoreView: null,
        pageNum: 1
    },
    onLoad() {
        this.getComments()
    },
    getComments() {
        tt.request({
            url: get_comment_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageNum,
                pageSize: page_size
            },
            header: {
                "content-type": "application/json",
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) return
                this.setData({
                    comments: res.data.data
                })
            },
            fail(res) {}
        })
    },
    getMoreComments() {
        tt.request({
            url: get_comment_url,
            method: 'GET',
            dataType: 'text',
            data: {
                pageNum: this.data.pageNum,
                pageSize: page_size
            },
            header: {
                "content-type": "application/json",
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code != 200) {
                    this.data.pageNum -= 1
                    this.data.loadMoreView.loadMoreFail()
                    return
                }
                this.setData({
                    comments: this.data.comments.concat(res.data.data)
                })
                this.data.loadMoreView.loadMoreComplete(res.data.data.length === page_size)
            },
            fail: (res) => {
                this.data.pageNum -= 1
                this.data.loadMoreView.loadMoreFail()
            }
        })
    },
    onReady: function() {
        this.selectComponent("#loadMoreView", (res) => {
            console.log("selectComponent", res)
            this.data.loadMoreView = res
        })
    },
    ontapHasFollowedButton: function(e) {
        tt.request({
            url: delete_follow_url + e.currentTarget.dataset.followId,
            method: 'DELETE',
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                console.log("delete follow succeed", res.data)
                this.data.followDetails[e.currentTarget.dataset.index].hasFollow = false;
                this.setData({
                    followDetails: this.data.followDetails
                })
            },
            fail(res) {}
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