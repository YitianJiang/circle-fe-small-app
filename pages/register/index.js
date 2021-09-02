var app = getApp()
var register_url = app.data.base_url + "/user/create"
var login_url = app.data.base_url + "/user/login"
var GREY_STYLE = "background-color: #d6d6d6;"
var GREEN_STYLE = "background: linear-gradient(to right,#33d671,#33d889,#34daad);"

Page({
    data: {
        name: "",
        password: "",
        buttonStyle: GREY_STYLE
    },
    formSubmit: function(event) {
        console.log("event", event)
        let requestBody = {
            name: event.detail.value.name,
            password: event.detail.value.password
        }
        console.log("requestBody", requestBody)
        tt.request({
            url: register_url,
            method: 'POST',
            data: requestBody,
            success: (res) => {
                if (res.data.code === 200) {
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
                        title: '注册成功', // 内容
                        duration: 1000
                    })
                    setTimeout(() => {
                        tt.navigateBack();
                    }, 1000)
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
    }
})