Component({
    data: {},
    properties: {
        hotspots: {
            type: Object,
            value: {}
        },
    },
    methods: {
        onTapHotspot(event) {
            this.triggerEvent("taphotspot", { inputValue: event.currentTarget.dataset.text })
        }
    }
})