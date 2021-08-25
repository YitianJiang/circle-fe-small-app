import { solvelong } from '../../../common/solvelong.js'

var app = getApp()
var get_myfans_url = app.data.base_url + "/user/follow/myFans/"
var delete_follow_url = app.data.base_url + "/user/follow/delete/"
var follow_url = app.data.base_url + "/user/follow/create"
var page_size = 10

Page({
    useStore: true,
    data: {
        followDetails: [],
        isLogined: app.isLogined,
        loadMoreView: null,
        pageNum: 1
    },
    onLoad() {
        this.getFans()
    },
    getFans() {
        tt.request({
            url: get_myfans_url,
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
                res.data.data.forEach(followDetail => {
                    followDetail.hasFollow = true
                })
                console.log("followdata", res.data)
                this.setData({
                    followDetails: res.data.data
                })
            },
            fail(res) {}
        })
    },
    getMoreFans() {
        tt.request({
            url: get_myfans_url,
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
                res.data.data.forEach(followDetail => {
                    followDetail.hasFollow = true
                })
                console.log("followdata", res.data)
                this.setData({
                    followDetails: this.data.followDetails.concat(res.data.data)
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
        console.log("ontapHasFollowedButton", e)
        tt.request({
            url: delete_follow_url + e.currentTarget.dataset.followId,
            method: 'DELETE',
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '取消关注失败',
                        icon: "none"
                    })
                    return
                }
                console.log("delete follow succeed", res.data)
                this.data.followDetails[e.currentTarget.dataset.index].hasFollow = false;
                this.setData({
                    followDetails: this.data.followDetails
                })
            },
            fail(res) {
                tt.showToast({
                    title: '网络崩溃，取消关注失败',
                    icon: "none"
                })
            }
        })
    },
    ontapFollowButton: function(e) {
        let requestBody = {
            toUserId: e.currentTarget.dataset.userId
        }
        tt.request({
            url: follow_url,
            method: 'POST',
            dataType: 'text',
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            data: requestBody,
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                console.log("follow succeed", res.data)
                this.data.followDetails[e.currentTarget.dataset.index].hasFollow = true;
                this.data.followDetails[e.currentTarget.dataset.index].id = res.data.data
                this.setData({
                    followDetails: this.data.followDetails
                })
            },
            fail(res) {}
        })
    },
    onTapLogin: function(e) {
        tt.navigateTo({
            url: '/pages/login/index?pageIndex=' + '/pages/user-detail/fans/index'
        })
    },
    onReachBottom() {
        console.log("reach bottom")
        this.data.loadMoreView.loadMore()
    },
    loadMoreListener: function(e) {
        this.data.pageNum += 1
        this.getMoreFans()
    },
    clickLoadMore: function(e) {
        this.loadMoreListener()
    }
})