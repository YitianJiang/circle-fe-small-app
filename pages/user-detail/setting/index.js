var app = getApp()

Page({
    useStore: true,
    data: {

    },
    onTapExit() {
        tt.setStorageSync("token", "")
        app.store.setState({
            isLogined: false,
            currentUser: {
                id: 0
            }
        })
    }
})