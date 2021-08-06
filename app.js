import store from './store/index'
App({
    store,
    data: {
        base_url: "http://47.88.11.78:8201/circle-main",
    },
    onLaunch: function() {},
    onShow: function() {
        console.log('App Show');
    },
    onHide: function() {
        console.log('App Hide');
    },
});