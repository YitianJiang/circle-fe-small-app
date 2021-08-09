import { uploadFile, getIdSecretToken } from '../../../common/UploadAliyun/UploadAliyun.js'

var app = getApp()
var update_user_info_url = app.data.base_url + "/user/update"
var OSS_DOWNLOAD_PREFIX = "https://yitianjiang-circle.oss-cn-beijing.aliyuncs.com/"

Page({
    useStore: true,
    data: {
        height: "0",
        isHidden: true,
        inputWrapperStyle: "",
        valueToBeSet: "",
        inputDefaultValue: "",
        currentInputValue: "dsfsfd",
        submitType: ""
    },
    ontapUserNameRow: function() {
        this.data.valueToBeSet = "用户名"
        console.log("this", this)
        this.data.inputDefaultValue = this.data.$state.currentUser.name
        this.data.submitType = "name"
        this.setData({
            [`height`]: "40%",
            [`isHidden`]: false,
            [`valueToBeSet`]: this.data.valueToBeSet,
            [`inputDefaultValue`]: this.data.inputDefaultValue
        })
    },
    ontapIntroductionRow: function() {
        this.data.valueToBeSet = "简介"
        this.data.inputDefaultValue = this.data.$state.currentUser.introduction
        this.data.submitType = "introduction"
        this.setData({
            [`height`]: "40%",
            [`isHidden`]: false,
            [`valueToBeSet`]: this.data.valueToBeSet,
            [`inputDefaultValue`]: this.data.inputDefaultValue
        })
    },
    ontapMaskLayer: function() {
        this.setData({
            [`height`]: "0",
            [`isHidden`]: true,
            [`inputWrapperStyle`]: ""
        })
    },
    onFocus: function() {
        this.setData({
            [`inputWrapperStyle`]: "border: #0d84ff 3rpx solid;"
        })
    },
    onSubmit: function(event) {
        let requestBody = {}
        if (this.data.submitType === "name") {
            if (event.detail.value.input === this.data.$state.currentUser.name) {
                this.ontapMaskLayer()
                return
            }
            requestBody = { name: event.detail.value.input }
        }
        if (this.data.submitType === "introduction") {
            if (event.detail.value.input === this.data.$state.currentUser.introduction) {
                this.ontapMaskLayer()
                return
            }
            requestBody = { introduction: event.detail.value.input }
        }
        tt.request({
            url: update_user_info_url,
            method: 'POST',
            data: requestBody,
            header: {
                Authorization: "Bearer " + tt.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code === 200) {
                    console.log("update user info succeed", res.data)
                    let { currentUser } = app.store.getState()
                    if (this.data.submitType === "name") currentUser.name = event.detail.value.input
                    if (this.data.submitType === "introduction") currentUser.introduction = event.detail.value.input
                    app.store.setState({
                        currentUser
                    })
                } else {
                    tt.showToast({
                        title: '更新用户信息失败'
                    })
                }
            },
            fail: (res) => {
                tt.showToast({
                    title: '网络错误'
                })
            },
            complete: () => {
                this.ontapMaskLayer()
            }
        })
        console.log("event", event)
    },
    onTapAvatarRow: function() {
        console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")
        let that = this
        tt.chooseImage({
            sourceType: ['album'],
            count: 1,
            success: (chooseResult) => {
                if (!chooseResult || !chooseResult.tempFilePaths) return
                getIdSecretToken().then((idSecretToken) => {
                    uploadFile({
                        filePath: chooseResult.tempFilePaths[0],
                        dir: "UserAvatars/" + that.data.$state.currentUser.id + "/",
                        success: function() {
                            let avatarUrl = OSS_DOWNLOAD_PREFIX + this.dir + chooseResult.tempFilePaths[0].replace(/ttfile:/, "ttfile%3A")
                            let requestBody = { avatarUrl }
                            tt.request({
                                url: update_user_info_url,
                                data: requestBody,
                                method: 'POST',
                                header: {
                                    "Authorization": "Bearer " + tt.getStorageSync('token')
                                },
                                success(res) {
                                    if (res.data.code != 200) {
                                        tt.showToast({
                                            title: '更新头像失败'
                                        })
                                        return
                                    }
                                    console.log("success", new Date().getTime())
                                    tt.showToast({
                                        title: '更新头像成功',
                                        icon: "none",
                                    })
                                    app.store.setState({
                                        [`currentUser.avatarUrl`]: avatarUrl
                                    })
                                },
                                fail(res) {
                                    tt.showToast({
                                        title: '网络崩溃，更新头像失败'
                                    })
                                }
                            })
                        },
                        fail: function() {
                            tt.showToast({
                                title: '更新头像失败'
                            })
                        }
                    }, idSecretToken)
                }).catch((err) => {
                    console.log("update avatar fail", err)
                    tt.showToast({
                        title: '更新头像失败'
                    })
                })
            },
            fail: (err) => {
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", err)
            }
        })
    }
})