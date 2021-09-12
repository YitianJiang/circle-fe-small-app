import { solvelong } from '../../common/solvelong.js'

var app = getApp()
var register_url = app.data.base_url + "/user/create"
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
        console.log("event", event)
        if (this.data.isLoading === true) return
        if (!this.data.name) {
            tt.showToast({
                title: '用户名不能为空',
                icon: 'none'
            })
            return
        }
        if (!this.data.password) {
            tt.showToast({
                title: '密码不能为空',
                icon: 'none'
            })
            return
        }
        //event.detail.value中只有一个值:name, password为undefined
        let requestBody = {
            name: this.data.name,
            password: this.data.password
        }
        console.log("request body", requestBody)
        this.setData({
            isLoading: true
        })
        tt.request({
            url: register_url,
            method: 'POST',
            dataType: 'text',
            data: requestBody,
            success: (res) => {
                res.data = solvelong.getRealJsonData(res.data)
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
                console.log("register success")
                tt.showToast({
                    title: '注册成功',
                    duration: 1000
                })
                tt.setStorageSync("token", res.data.data.tokenDetail.token);
                app.store.setState({
                        isLogined: true,
                        currentUser: res.data.data.userDetail
                    })
                    //如果之前的login 页面没有销毁 switchTab不会生效
                tt.switchTab({
                    url: '/pages/mine/index'
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