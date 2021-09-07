Component({
    // 组件的属性列表
    attached() {
        this.data.screenWidth = tt.getSystemInfoSync().windowWidth

    },
    properties: {
        isRefreshing: {
            type: Boolean,
            value: false
        },
        imageSrc: {
            type: String,
            value: "./refresh.png"
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        left: 25,
        top: 400,
        initialClientX: 0,
        initialClientY: 0,
        initialLeft: 25,
        initialTop: 400,
        time: 0,
        intervalTime: 3,
        screenWidth: 0,
        lastLeft: 0,
        lastTop: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onTouchStart(e) {
            this.data.initialClientX = e.touches[0].clientX
            this.data.initialClientY = e.touches[0].clientY
            this.data.lastLeft = this.data.initialLeft
            this.data.lastTop = this.data.initialTop
            console.log(e, "initialClientX", this.data.initialClientX, "initialClientY", this.data.initialClientY)
        },
        onTouchMove(e) {
            this.data.time += 1
            if (this.data.time % 2 != 0) return

            this.setData({
                left: this.data.lastLeft,
                top: this.data.lastTop
            })
            this.data.lastLeft = this.data.initialLeft + (e.touches[0].clientX - this.data.initialClientX)
            this.data.lastTop = this.data.initialTop + (e.touches[0].clientY - this.data.initialClientY)
            console.log(e, "left", this.data.left, "top", this.data.top)
        },
        onTouchEnd(e) {
            console.log(e, "end ClientX", e.changedTouches[0].clientX, "end ClientY", e.changedTouches[0].clientY)
            if (e.changedTouches[0].clientX < this.data.screenWidth / 2) {
                this.setData({
                    left: 25,
                    top: this.data.initialTop + (e.changedTouches[0].clientY - this.data.initialClientY)
                })
                this.data.initialLeft = 25
            }
            if (e.changedTouches[0].clientX >= this.data.screenWidth / 2) {
                this.setData({
                    left: this.data.screenWidth - 60,
                    top: this.data.initialTop + (e.changedTouches[0].clientY - this.data.initialClientY)
                })
                this.data.initialLeft = this.data.screenWidth - 60
            }
            this.data.initialTop = e.changedTouches[0].clientY
            this.data.time = 0
        }
    }
})