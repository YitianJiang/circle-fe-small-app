var app = getApp()
var register_url = app.data.base_url + "/user/create"
var login_url = app.data.base_url + "/user/login"
var GREY_STYLE = "background-color: #d6d6d6;"
var GREEN_STYLE = "background: linear-gradient(to right,#33d671,#33d889,#34daad);"

Page({
    data: {
        name: "",
        password: "",
        buttonStyle: GREY_STYLE,
        isLoading: false,
    },
    formSubmit: function(event) {
        if (this.data.isLoading === true) return
        console.log("event", event)
        let requestBody = {
            name: event.detail.value.name,
            password: event.detail.value.password
        }
        this.setData({
            isLoading: true
        })
        tt.request({
            url: register_url,
            method: 'POST',
            data: requestBody,
            success: (res) => {
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '注册失败',
                        icon: 'fail'
                    })
                }
                //不能导航到倒数第二层
                // tt.request({
                //   url: login_url,
                //   method: 'POST',
                //   data: requestBody,
                //   success: (res) => {
                //     if(res.data.code === 200){
                //       tt.setStorageSync("token", res.data.data.token);
                //       console.log("sucess login",res)
                //       console.log(getCurrentPages())
                //       tt.navigateBack({
                //         delta: 2
                //       })
                //     }
                //   },  
                // })
                tt.showToast({
                    title: '注册成功',
                    duration: 1000
                })
                tt.setStorageSync("token", res.data.data.tokenDetail.token);
                app.store.setState({
                    isLogined: true,
                    currentUser: res.data.data.userDetail
                })
                tt.navigateBack({
                    fail(res) {
                        tt.showToast({
                            title: '123',
                            success: (res) => {

                            }
                        });
                    }
                })
            },
            fail: () => {
                tt.showToast({
                    title: '网络崩溃',
                    icon: 'none'
                })
            },
            complete: () => {
                this.setData({
                    isLoading: false
                })
            }
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
    }
})