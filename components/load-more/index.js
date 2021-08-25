Component({
    properties: {
        // 加载中的显示文本
        loadingText: {
            type: String,
            value: '加载中...'
        },
        // 加载失败的显示文本
        failText: {
            type: String,
            value: '加载失败, 请点击重试!'
        },
        // 没有更多后的显示文本, 默认没有则隐藏加载更多控件
        finishText: {
            type: String,
            value: '已经到底了'
        }
    },
    data: {
        showThis: false,
        text: '',
        showIcon: false,
        isLoading: false,
        hasData: true
    },
    methods: {
        loadMore: function() {
            //如果没有数据了，直接返回，不再发送网络请求
            if (this.data.hasData === false) {
                return
            }
            //如果正在加载数据，直接返回，等加载完了，如果有触底，再加载下一批数据
            if (this.data.isLoading === true) {
                return
            }
            this.data.isLoading = true
            this.setData({
                showThis: true,
                showIcon: true
            })
            this.triggerEvent('loadMoreListener')
        },
        //加载完成, 传入hasMore 
        loadMoreComplete: function(hasData) {
            this.data.hasData = hasData
            this.data.isLoading = false
            if (hasData) {
                this.setData({
                    showThis: false,
                    showIcon: false,
                    text: ""
                })
            } else {
                this.setData({
                    showThis: true,
                    showIcon: false,
                    text: this.properties.finishText
                })
            }
        },
        // 加载失败
        loadMoreFail: function() {
            this.data.isLoading = false
            this.setData({
                showThis: true,
                showIcon: false,
                text: this.properties.failText
            })
        },
        //点击 loadmore 控件时触发, 只有加载失败时才会进入页面回调方法
        clickLoadMore: function() {
            if (this.data.text != this.properties.failText) return
            this.setData({
                showThis: true,
                showIcon: true,
                text: this.properties.loadingText,
            })
            this.triggerEvent('clickLoadMore')
        }
    }
})