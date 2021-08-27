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
            })
        }
    }
})