import Store from "wxministore"
export default new Store({
    state: {
        isLogined: false,
        currentUser: {
            id: 0
        }
    },
    openPart: true
})