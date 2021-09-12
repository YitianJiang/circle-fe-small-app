import { solvelong } from '../common/solvelong'

export function myRequest(obj) {
    console.log("obj", obj)
    let requestObj = {
        dataType: 'text',
        success: (res) => {
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
                title: '网络崩溃',
                icon: "fail"
            })
            if (obj.failCallback) obj.failCallback()
        }
    }
    requestObj = {...obj, ...requestObj }
    console.log("requestObj", requestObj)
    tt.request(requestObj)
}