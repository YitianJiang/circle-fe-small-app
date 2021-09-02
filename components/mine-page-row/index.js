Component({
    data: {
        backgroundColor: "white"
    },
    properties: {
        text: {
            type: String,
            value: ""
        }
    },
    methods: {
        onTouchStartRow() {
            this.setData({
                backgroundColor: "rgba(100, 100, 100, 0.4)"
            })
        },
        onTouchEndRow() {
            this.setData({
                backgroundColor: "white"
            }, () => {
                //这里如果点击row之后就导航到另一个页面，ui会发生错乱，可能onTouchEndRow的setData还没把ui更新完成,
                //就已经导航到另一个界面，所以这里先把ui更新完，再发送一个事件,使用组件的页面收到这个事件后再进行导航。
                setTimeout(() => {
                    this.triggerEvent("touchrowend")
                }, 100)
            })
        }
    }
})