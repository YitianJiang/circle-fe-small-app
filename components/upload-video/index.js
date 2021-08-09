import { uploadFile, getIdSecretToken } from '../../common/UploadAliyun/UploadAliyun.js'
import "../../common/number.js"
import { keepTwoDecimal } from "../../common/number.js";

Component({
    lifetimes: {
        attached: function() {
            // 在组件实例进入页面节点树时执行
            console.log("this", this)
                // if (this.data.videoObject.width < this.data.videoObject.height) {
                //     this.setData({
                //         [`videoWidth`]: 400,
                //         [`videoHeight`]: 400 * (this.data.videoObject.height / this.data.videoObject.width)
                //     })
                // } else {
                //     this.setData({
                //         [`videoWidth`]: 600,
                //         [`videoHeight`]: 600 * (this.data.videoObject.height / this.data.videoObject.width)
                //     })
                // }
            getIdSecretToken().then((idSecretToken) => {
                this.data.uploadTask = uploadFile({
                    filePath: this.data.videoObject.tempFilePath,
                    dir: this.data.dir,
                    success() {
                        console.log("upload success")
                    },
                    fail(res) {
                        console.log("upload fail", res)
                        tt.showToast({
                            title: '上传失败',
                            icon: "fail"
                        })
                    }
                }, idSecretToken)
                console.log("upload video task", this.data.uploadTask)
                let alreadySent = 0
                let date = new Date()
                let initialTimeStamp = date.getTime()
                this.data.uploadTask.onProgressUpdate((res) => {
                    if (res.progress === 100) {
                        console.log("upload complete")
                        this.setData({
                            [`uploadComplete`]: true,
                            [`uploadCompletionRate`]: res.progress
                        })
                    } else {
                        let nowTimestamp = new Date().getTime()
                        if (nowTimestamp - initialTimeStamp > 1000) {
                            let speed = keepTwoDecimal((res.totalBytesSent - alreadySent) / (1024 * 1024) / 0.5)
                            initialTimeStamp = nowTimestamp
                            alreadySent = res.totalBytesSent
                            console.log("speed", speed, "remaining time", Math.round((res.totalBytesExpectedToSend - alreadySent) / (speed * 1024 * 1024)),
                                "totalBytesExpectedToSend", res.totalBytesExpectedToSend, keepTwoDecimal(res.totalBytesExpectedToSend / (speed * 1024 * 1024)))
                            this.setData({
                                [`speed`]: speed,
                                [`remainingTime`]: Math.round((res.totalBytesExpectedToSend - alreadySent) / (speed * 1024 * 1024)),
                                [`uploadCompletionRate`]: res.progress
                            })
                        }
                    }
                })
            }).catch((err) => {
                tt.showToast({
                    title: '上传失败',
                    icon: "fail"
                })
                return
            })
        }
    },
    properties: {
        // 这里定义了 headerText 属性，属性值可以在组件使用时指定
        videoObject: {
            type: Object,
            value: null,
        },
        dir: {
            type: String,
            value: ""
        },
        width: {
            type: String,
            value: ""
        },
        height: {
            type: String,
            value: ""
        }
    },
    data: {
        // 组件内部数据
        uploadTask: null,
        uploadComplete: false,
        speed: 1.0,
        remainingTime: 1.0,
        uploadCompletionRate: 0,
        // videoWidth: 0,
        // videoHeight: 0
    },
    methods: {
        deleteVideo() {
            if (this.data.uploadComplete === false) this.data.uploadTask.abort()
            this.triggerEvent("deletevideo", {}, { bubbles: true });
        }
        // 自定义方法
    }
});