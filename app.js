import store from './store/index'

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i
    }
    return -1
}
Array.prototype.remove = function(val) {
    var index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}

App({
    store,
    data: {
        base_url: "https://acircle.fun:8201/circle-main",
    }
})