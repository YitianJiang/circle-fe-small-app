export function timeTransform(createTime) {
    let nowTime = new Date()
    let publishTime = new Date(createTime)
    let nowTimestamp = Date.parse(nowTime)
    let publishTimestamp = Date.parse(publishTime)

    if (nowTime.toLocaleDateString() === publishTime.toLocaleDateString()) {
        let localTimeString = publishTime.toLocaleTimeString()
        return localTimeString.substring(0, localTimeString.lastIndexOf(":"))
    } else if (nowTime.getFullYear() === publishTime.getFullYear() && nowTime.getMonth() === publishTime.getMonth()) {
        return nowTime.getDate() - publishTime.getDate() + "天前"
    } else if (nowTime.getFullYear() === publishTime.getFullYear()) {
        return nowTime.getMonth() - publishTime.getMonth() + "月前"
    } else {
        return nowTime.getFullYear() - publishTime.getFullYear() + "年前"
    }
}