Component({
    data: {
        reloadButtonBackgroundColor: "rgba(0, 153, 255, 0.1)"
    },
    properties: {
        isNetworkFault: {
            type: Boolean,
            value: false
        },
        isServerFault: {
            type: Boolean,
            value: false
        },
        showReload: {
            type: Boolean,
            value: false
        }
    },
    methods: {
        onTouchStartReload() {
            this.setData({
                reloadButtonBackgroundColor: "rgba(0, 153, 255, 0.3)"
            })
        },
        onTouchEndReload() {
            this.setData({
                reloadButtonBackgroundColor: "rgba(0, 153, 255, 0.1)"
            })
        },
        onTapReload() {
            this.triggerEvent("touchreload")
        }
    }
})