import { uploadFile, getIdSecretToken } from '../../common/UploadAliyun/UploadAliyun.js'
var emoji = require('../../common/emoji')

var app = getApp()
var OSS_DOWNLOAD_PREFIX = "https://yitianjiang-circle.oss-cn-beijing.aliyuncs.com/"
var article_create_url = app.data.base_url + "/article/create"
var SEND_VIDEO = "sendVideo"
var SEND_PICTURES = "sendPictures"
var NONE = "none"

Page({
    useStore: true,
    data: {
        imageUrls: [],
        videoUrl: "",
        text: '',
        index: 0,
        showEmoji: false,
        emojiList: [],
        videoObject: {},
        dir: "",
        showSendTypeList: false,
        sendType: NONE,
        sendTypeListTop: 0,
        sendTypeListLeft: 0,
        videoWidth: "",
        videoHeight: "",
        hideMask: true,
        isPublishComplete: true
    },
    onLoad: function() {
        const list = []
        for (let i = 0; i < 78; i++) {
            list.push(`/emoji/${i+1}.png`)
        }
        this.setData({
            emojiList: list,
        })
    },
    showEmoji() {
        this.setData({
            showEmoji: !this.data.showEmoji,
        })
    },
    addEmoji(e) {
        const index = e.currentTarget.dataset.index
        const url = this.data.emojiList[index]
        const key = this.findKey(emoji.emojiMap, url)
        const originContent = this.data.text
        this.setData({
            text: originContent.concat(key),
        })
    },
    findKey(obj, value, compare = (a, b) => a === b) {
        return Object.keys(obj).find(k => compare(obj[k], value))
    },
    onTextInput: function(e) {
        this.setData({
            text: e.detail.value
        })
    },
    chooseSendType(event) {
        this.setData({
            [`showSendTypeList`]: !this.data.showSendTypeList,
            [`sendTypeListLeft`]: event.changedTouches[0].clientX,
            [`sendTypeListTop`]: event.changedTouches[0].clientY,
            [`hideMask`]: false
        })
    },
    chooseImage() {
        console.log("choose image xxxxxxxxxxxxxxxxxxxx")
        this.setData({
            [`showSendTypeList`]: false
        })
        const currentLength = this.data.imageUrls.length
        let that = this
        tt.chooseImage({
            sourceType: ['album'],
            count: 9 - currentLength,
            success(res) {
                if (currentLength >= 9) {
                    tt.showToast({
                        title: '最多上传9张图片',
                        icon: "none"
                    })
                    return
                }
                if (!res || !res.tempFilePaths) {
                    return
                }
                let uploadImages = []
                if (currentLength + res.tempFilePaths.length > 9) {
                    uploadImages = that.data.imageUrls.concat(res.tempFilePaths.slice(0, 9 - currentLength))
                } else {
                    uploadImages = that.data.imageUrls.concat(res.tempFilePaths)
                }
                that.setData({
                    imageUrls: uploadImages,
                    [`sendType`]: SEND_PICTURES
                })
            },
            fail: (err) => {
                console.log("fail to cboose image", err)
            },
            complete() {
                console.log("choose image", this)
                    //输出undefined 使用lamda能够获取到this
                that.setData({
                    [`hideMask`]: true
                })
            }
        })
    },
    chooseVideo(event) {
        console.log("choose video", event)
        this.setData({
            [`showSendTypeList`]: false
        })
        let that = this
        tt.chooseVideo({
            sourceType: ["album", "camera"],
            compressed: true,
            maxDuration: 600,
            success: (res) => {
                let dir = "UserVideos/" + that.data.$state.currentUser.id + "/" + new Date().getTime() + "/"
                this.data.videoUrl = OSS_DOWNLOAD_PREFIX + dir + res.tempFilePath
                console.log("videoUrl", this.data.videoUrl)
                if (res.width < res.height) {
                    that.setData({
                        [`sendType`]: SEND_VIDEO,
                        [`videoObject`]: res,
                        [`dir`]: dir,
                        [`videoWidth`]: "400rpx",
                        [`videoHeight`]: 400 * (res.height / res.width) + "rpx"
                    })
                } else {
                    that.setData({
                        [`sendType`]: SEND_VIDEO,
                        [`videoObject`]: res,
                        [`dir`]: dir,
                        [`videoWidth`]: "620rpx",
                        [`videoHeight`]: 620 * (res.height / res.width) + "rpx"
                    })
                }
            },
            fail: (err) => {
                console.log("fail to choose video", err)
            },
            complete() {
                that.setData({
                    [`hideMask`]: true
                })
            }
        })
    },
    deleteImage(e) {
        const index = e.currentTarget.dataset.index
        this.data.imageUrls.splice(index, 1)
        if (this.data.imageUrls.length != 0) {
            this.setData({
                imageUrls: this.data.imageUrls
            })
        }
        if (this.data.imageUrls.length == 0) {
            this.setData({
                imageUrls: this.data.imageUrls,
                sendType: NONE
            })
        }
    },
    deleteVideo() {
        this.setData({
            [`sendType`]: NONE
        })
    },
    previewImage(e) {
        const index = e.currentTarget.dataset.index
        tt.previewImage({
            current: this.data.imageUrls[index],
            urls: this.data.imageUrls
        })
    },
    uploadPicture(index, timestamp, idSecretToken) {
        return new Promise((resolve, reject) => {
            let that = this
            uploadFile({
                filePath: that.data.imageUrls[index],
                dir: "UserImages/" + that.data.$state.currentUser.id + "/" + timestamp + "/",
                success: function(res) {
                    console.log("upload picture timestamp", new Date().getTime())
                    console.log("imageUrls", "current index", that.data, index)
                    that.data.imageUrls[index] = OSS_DOWNLOAD_PREFIX + this.dir + that.data.imageUrls[index].replace(/ttfile:/, "ttfile%3A")
                    resolve("success")
                },
                fail: function(res) {
                    reject("fail to upload picture to oss", res)
                }
            }, idSecretToken)
        })
    },
    uploadPictures(idSecretToken) {
        let result = []
        let timestamp = new Date().getTime()
        for (let i = 0; i < this.data.imageUrls.length; i++) {
            result.push(this.uploadPicture(i, timestamp, idSecretToken))
        }
        return result
    },
    createArticle() {
        let requestBody = {
            text: this.data.text,
            createTime: new Date()
        }
        if (this.data.sendType === SEND_PICTURES) Object.assign(requestBody, { imageUrls: this.data.imageUrls })
        if (this.data.sendType === SEND_VIDEO) Object.assign(requestBody, { videoUrl: this.data.videoUrl })
        console.log("create article request body", requestBody)
        let that = this
        tt.request({
            url: article_create_url,
            data: requestBody,
            method: 'POST',
            header: {
                "Authorization": "Bearer " + tt.getStorageSync('token')
            },
            success(res) {
                console.log("res", res)
                if (res.data.code != 200) {
                    tt.showToast({
                        title: '发布失败',
                        icon: "fail",
                    })
                    return
                }
                console.log("success", new Date().getTime())
                tt.showToast({
                    title: '发布成功',
                    icon: "success",
                })
                if (that.data.sendType === SEND_PICTURES) {
                    that.setData({
                        text: '',
                        imageUrls: [],
                        index: 0,
                        sendType: NONE
                    })
                } else if (that.data.sendType === SEND_VIDEO) {
                    that.setData({
                        text: '',
                        videoUrl: "",
                        sendType: NONE
                    })
                } else if (that.data.sendType === NONE) {
                    that.setData({
                        text: '',
                    })
                }
            },
            fail(res) {
                tt.showToast({
                    title: '网络错误',
                    icon: "fail",
                })
            },
            complete: () => {
                this.data.isPublishComplete = true
            }
        })
    },
    publish() {
        if (this.data.isPublishComplete === false) {
            console.log("正在发送")
            return
        }
        this.data.isPublishComplete = false
        if (this.data.sendType === SEND_PICTURES) {
            if (this.data.text === '' && this.data.imageUrls.length === 0) {
                tt.showToast({
                    title: '发布内容不能为空！',
                    icon: "none",
                })
                return
            }
            console.log("getIdSecretToken", getIdSecretToken)
            getIdSecretToken().then((idSecretToken) => {
                Promise.all(this.uploadPictures(idSecretToken)).then(res => {
                    this.createArticle()
                })
            }).catch((err) => {
                console.log("发布失败", err)
                tt.showToast({
                    title: "发布失败",
                    icon: "fail",
                })
            })
        } else if (this.data.sendType === SEND_VIDEO) {
            if (this.data.text === '' && this.data.videoUrl === "") {
                tt.showToast({
                    title: '发布内容不能为空！',
                    icon: "none",
                })
                return
            }
            this.createArticle()
        } else if (this.data.sendType === NONE) {
            if (this.data.text === '') {
                tt.showToast({
                    title: '发布内容不能为空！',
                    icon: "none",
                })
                return
            }
            this.createArticle()
        }
    },
    onTapLogin() {
        tt.navigateTo({
            url: '/pages/login/index' // 指定页面的url
        })
    },
    onTapMask() {
        this.setData({
            hideMask: true,
            showSendTypeList: false
        })
    }
})