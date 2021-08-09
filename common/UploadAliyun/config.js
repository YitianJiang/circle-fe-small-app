// var fileHost = "https://oss.console.aliyun.com/bucket/oss-cn-beijing/yitianjiang-circle"
var fileHost = "https://yitianjiang-circle.oss-cn-beijing.aliyuncs.com"
var config = {
    //aliyun OSS config
    uploadImageUrl: `${fileHost}`, //默认存在根目录，可根据需求改
    timeout: 87600 //这个是上传文件时Policy的失效时间
};
module.exports = config