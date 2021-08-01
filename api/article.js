import "./baseUrl"
import { baseUrl } from "./baseUrl"

export function createArticle(requestBody, dataToSet, that) {
    tt.request({
        url: baseUrl + "/article/create",
        data: requestBody,
        method: 'POST',
        header: {
            "Authorization": "Bearer " + tt.getStorageSync('token')
        },
        success(res) {
            if (res.data.code != 200) {
                tt.showToast({
                    title: '发布失败',
                    icon: "fail",
                })
                return
            }
            console.log("success", new Date().getTime())
            tt.showToast({
                title: '发布成功',
                icon: "success",
            })
            that.setData(dataToSet)
        },
        fail(res) {
            tt.showToast({
                title: '网络错误',
                icon: "fail",
            })
        }
    })
}