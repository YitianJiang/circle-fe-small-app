import Store from '../common/store.js'
export default new Store({
    state: {
        isLogined: false,
        currentUser: {
            id: 0
        }
    },
    openPart: true
})