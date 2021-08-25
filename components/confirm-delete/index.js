Component({
    data: {},
    attached() {
        console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", this)
    },
    properties: {
        upperText: {
            type: String,
            value: ""
        },
        middleText: {
            type: String,
            value: ""
        }
    },
    methods: {
        cancelDelete: function() {
            this.triggerEvent("canceldelete")
        },
        onTapDelete: function() {
            this.triggerEvent("tapdelete")
        }
    }
})