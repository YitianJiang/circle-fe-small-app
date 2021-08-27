var app = getApp()
var get_current_user_info_url = app.data.base_url + "/user/info"
var login_url = app.data.base_url + "/user/login"

Page({
    useStore: true,
    data: {
        logoTextMap: {
            "我的关注": "/pictures/mine-follow.png",
            // "我的粉丝": "/pictures/mine-follower.png",
            "我的文章": "/pictures/mine-article.png",
            "我的收藏": "/pictures/mine-bookmark.png",
            "我的评论": "/pictures/mine-comment.png",
            "我的点赞": "/pictures/mine-like.png",
            "设置": "/pictures/setting.png"
                // "浏览历史": "../pictures/browser-history.png"
        }
    },
    onTapLogin: function(event) {
        tt.navigateTo({
            url: '/pages/login/index?pageIndex=' + "/pages/mine/index"
        })
    },
    onNavigate: function(event) {
        if (this.data.$state.isLogined === false) {
            tt.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }
        switch (event.currentTarget.dataset.index) {
            case "用户基本信息":
                tt.navigateTo({
                    url: '/pages/user-detail/user-base-info/index'
                })
                break
            case "我的关注":
                tt.navigateTo({
                    url: '/pages/user-detail/follow/index'
                })
                break
            case "我的粉丝":
                tt.navigateTo({
                    url: '/pages/user-detail/fans/index'
                })
                break
            case "我的文章":
                tt.navigateTo({
                    url: '/pages/user-detail/article/index'
                })
                break
            case "我的收藏":
                tt.navigateTo({
                    url: '/pages/user-detail/bookmark/index'
                })
                break
            case "我的评论":
                tt.navigateTo({
                    url: '/pages/user-detail/comment/index'
                })
                break
            case "我的点赞":
                tt.navigateTo({
                    url: '/pages/user-detail/like/index'
                })
                break
            case "设置":
                tt.navigateTo({
                    url: '/pages/user-detail/setting/index'
                })
                break
        }
    }
})