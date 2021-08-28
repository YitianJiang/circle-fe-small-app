import { solvelong } from '../common/solvelong'

export function myRequest(obj) {
    console.log("obj", obj)
    let requestObj = {
        dataType: 'text',
        success: (res) => {
            console.log("qqqqqqqqqqqqqqqqqqqqqqqqqq")
            res.data = solvelong.getRealJsonData(res.data)
            if (res.data.code != 200) {
                tt.showToast({
                    title: '操作失败',
                    icon: "fail"
                })
                return
            }
            if (obj.successCallback) obj.successCallback(res)
        },
        fail: () => {
            console.log("request failed", err)
            tt.showToast({
                title: '网络奔溃，操作失败',
                icon: "fail"
            })
            if (obj.failCallback) obj.failCallback()
        }
    }
    console.log("wwwwwwwwwwwwwwwwwwww", requestObj)
    requestObj = {...obj, ...requestObj }
    console.log("requestObj", requestObj)
    tt.request(requestObj)
}