Component({
    data: {},
    attached() {
        console.log("component confirm-delete attached", this)
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