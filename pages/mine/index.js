var app = getApp()
var get_current_user_info_url = app.data.base_url + "/user/info"
var login_url = app.data.base_url + "/user/login"

Page({
  useStore: true,
  data: {
    logoTextMap:{
      "我的关注": "/pictures/mine-follow.png",
      "我的粉丝": "/pictures/mine-follower.png",
      "我的文章": "/pictures/mine-article.png",
      "我的收藏": "/pictures/mine-bookmark.png",
      "我的评论": "/pictures/mine-comment.png",
      "我的点赞": "/pictures/mine-like.png",
      // "浏览历史": "../pictures/browser-history.png"
    }
  },
  // onShow: function(){
  //   let that = this
  //   tt.request({
  //     url: get_current_user_info_url,
  //     method: 'GET',
      // header: {
      //   "Authorization" : "Bearer " + tt.getStorageSync('token')
      // },
  //     success: (res) => {
  //       console.log("55555555555",this === that,res)
  //       if(res.data.code === 200){
  //         this.setData({
  //           [`isLogined`]: true,
  //           [`currentUser`]: res.data.data
  //         })
  //       }
  //     },    
  //   })
  // },
  onTapLogin: function(event){
    tt.navigateTo({
      url: '/pages/login/index?pageIndex=' + "/pages/mine/index"
    })
  },
  onTapUserInfo: function(event){
    tt.navigateTo({
      url: '/pages/user-detail/user-base-info/index'
    })
  },
  onTapRow: function(event){
    switch(event.currentTarget.dataset.index)
    {
      case "我的关注":
        tt.navigateTo({
          url: '/pages/user-detail/follow/index'
        })
        break;
      case "我的粉丝":
        tt.navigateTo({
          url: '/pages/user-detail/fans/index'
        })
        break;
      case "我的文章":
        tt.navigateTo({
          url: '/pages/user-detail/article/index'
        })
        break;
      case "我的收藏":
        tt.navigateTo({
          url: '/pages/user-detail/bookmark/index'
        })
        break;
      case "我的评论":
        tt.navigateTo({
          url: '/pages/user-detail/comment/index'
        })
        break;
      case "我的点赞":
        tt.navigateTo({
          url: '/pages/user-detail/like/index'
        })
        break;
    }
  }
})