Component({
    data: {
        focus: false,
        showCancelText: true,
    },
    properties: {
        inputValue: {
            type: String,
            value: ""
        }
    },
    methods: {
        onFocus() {
            this.setData({
                focus: true
            })
            this.triggerEvent("startsearch")
        },
        onTapCancel() {
            this.setData({
                focus: false
            })
            this.triggerEvent("cancelsearch")
        },
        onInput(event) {
            console.log("onInput", event)
            if (event.detail.value === "") {
                this.setData({
                    inputValue: event.detail.value,
                    showCancelText: true
                })
            }
            if (event.detail.value != "") {
                this.setData({
                    inputValue: event.detail.value,
                    showCancelText: false
                })
            }
        },
        onTapClearSearchText() {
            this.setData({
                inputValue: "",
                showCancelText: true
            })
        },
        confirmSearch() {
            this.triggerEvent("confirmsearch", { inputValue: this.data.inputValue })
        }
    }
})