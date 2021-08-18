import { solvelong } from '../../common/solvelong.js'

var app = getApp()
var login_url = app.data.base_url + "/user/login"
var GREY_STYLE = "background-color: #d6d6d6;"
var GREEN_STYLE = "background: linear-gradient(to right,#33d671,#33d889,#34daad);"

Page({
    data: {
        name: "",
        password: "",
        buttonStyle: GREY_STYLE,
        pageIndex: "",
        tabPages: ["/pages/publish/index", "/pages/mine/index"],
        otherPages: ["/pages/user-detail/follow/index", "/pages/user-detail/fans/index",
            "/pages/user-detail/like/index", "/pages/user-detail/bookmark/index", "/pages/user-detail/comment/index",
            "/pages/user-detail/article/index"
        ]
    },
    onLoad: function(options) {
        console.log("options", options)
        this.data.pageIndex = options.pageIndex
        console.log("receive pageIndex", this.data.pageIndex)
    },
    formSubmit: function(event) {
        console.log("event", event)
        let requestBody = {
            name: this.data.name,
            password: this.data.password
        }
        console.log("requestBody", requestBody)
        tt.request({
            url: login_url,
            method: 'POST',
            dataType: 'text',
            data: requestBody,
            header: {
                'content-type': 'application/json'
            },
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
                if (res.data.code === 200) {
                    console.log("login succeed", res.data)
                    tt.setStorageSync("token", res.data.data.tokenDetail.token);
                    app.store.setState({
                        isLogined: true,
                        currentUser: res.data.data.userDetail
                    }, () => {
                        if (this.data.tabPages.some(e => e === this.data.pageIndex)) {
                            tt.switchTab({
                                url: this.data.pageIndex
                            })
                        } else {
                            tt.navigateBack({
                                url: this.data.pageIndex
                            })
                        }
                    })
                } else {
                    tt.showToast({
                        title: '用户名或密码错误',
                        icon: 'fail'
                    });
                }
            },
        })
    },
    checkInput: function() {
        if (this.data.name != "" && this.data.password != "") {
            this.setData({
                [`buttonStyle`]: GREEN_STYLE
            })
        } else {
            this.setData({
                [`buttonStyle`]: GREY_STYLE
            })
        }
    },
    onInputName: function(event) {
        this.data.name = event.detail.value
        this.checkInput()
    },
    onInputPassword: function(event) {
        this.data.password = event.detail.value
        this.checkInput()
    },
    onTapRegister: function(event) {
        //用单引号,不用双引号
        // tt.navigateTo({
        //   url: "pages/register/index" 
        // });
        tt.navigateTo({
            url: '/pages/register/index'
        });
    }
})