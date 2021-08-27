Component({
    data: {},
    attached() {
        console.log("", this)
    },
    properties: {
        width: {
            type: Number,
            value: 400
        },
        height: {
            type: Number,
            value: 400
        },
        showHook: {
            type: Boolean,
            value: true
        },
        backgroundColor: {
            type: String,
            value: "rgb(0, 153, 255)"
        }
    },
    methods: {

    }
})