const env = require('./config.js');
const Base64 = require('./Base64.js');
require('./hmac.js');
require('./sha1.js');
const Crypto = require('./crypto.js');
var app = getApp()
const get_sts_token_url = app.data.base_url + "/oss/getALiYunOSSToken"
var accessKeyId = ""
var accessKeySecret = ""
var securityToken = ""

const getPolicyBase64 = function() {
    let date = new Date();
    console.log("gethours", date.getHours())
    date.setHours(date.getHours() + env.timeout);
    console.log("gethours", date.getHours())
    let srcT = date.toISOString();
    console.log("srcT", srcT)
    const policyText = {
        "expiration": srcT, //设置该Policy的失效时间
        "conditions": [
            ["content-length-range", 0, 500 * 1024 * 1024] // 设置上传文件的大小限制,500mb
        ]
    };
    const policyBase64 = Base64.encode(JSON.stringify(policyText));
    return policyBase64;
}

const getSignature = function(policyBase64, accessKeySecret) {
    const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accessKeySecret, {
        asBytes: true
    });
    const signature = Crypto.util.bytesToBase64(bytes);
    return signature;
}

const getIdSecretToken = function() {
    return new Promise((resolve, reject) => {
        tt.request({
            url: get_sts_token_url, // 目标服务器url
            success: (res) => {
                if (res.data.code != 200) {
                    console.log("get token fail", res)
                    reject(res)
                }
                resolve({
                    accessKeyId: res.data.data.credentials.accessKeyId,
                    accessKeySecret: res.data.data.credentials.accessKeySecret,
                    securityToken: res.data.data.credentials.securityToken
                })
            },
            fail: () => { reject(res) }
        })
    })
}
const uploadFile = function(params, idSecretToken) {
    console.log("upload params", params)
    if (!params.filePath) {
        tt.showModal({
            title: '图片为空',
            content: '请重试',
            showCancel: false,
        })
        return null;
    }
    console.log("upload picture to aliyun")
    const aliyunFileKey = params.dir + params.filePath;
    const aliyunServerURL = env.uploadImageUrl;
    const policyBase64 = getPolicyBase64()
    const signature = getSignature(policyBase64, idSecretToken.accessKeySecret)
    return tt.uploadFile({
        url: aliyunServerURL,
        filePath: params.filePath,
        name: 'file',
        formData: {
            'key': aliyunFileKey,
            'policy': policyBase64,
            'OSSAccessKeyId': idSecretToken.accessKeyId,
            'signature': signature,
            'success_action_status': '200',
            'x-oss-security-token': idSecretToken.securityToken

        },
        success: function(res) {
            console.log("upload success result", res)
            if (res.statusCode != 200) {
                if (params.fail) {
                    params.fail(res)
                }
                return;
            }
            if (params.success) {
                params.success(aliyunFileKey);
            }
        },
        fail: function(err) {
            console.log("upload fail err", err)
            if (params.fail) {
                params.fail(err)
            }
        }
    })
}

module.exports = { uploadFile, getIdSecretToken };