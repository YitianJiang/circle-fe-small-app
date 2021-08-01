const env = require('./config.js');

const Base64 = require('./Base64.js');

require('./hmac.js');
require('./sha1.js');
const Crypto = require('./crypto.js');


const uploadFile = function(params) {
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
    const accessid = env.OSSAccessKeyId;
    const policyBase64 = getPolicyBase64();
    const signature = getSignature(policyBase64);

    return tt.uploadFile({
        url: aliyunServerURL,
        filePath: params.filePath,
        name: 'file',
        formData: {
            'key': aliyunFileKey,
            'policy': policyBase64,
            'OSSAccessKeyId': accessid,
            'signature': signature,
            'success_action_status': '200',
        },
        success: function(res) {
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
            console.log(err)
            if (params.fail) {
                params.fail(err)
            }
        },
    })
}

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
            ["content-length-range", 0, 500 * 1024 * 1024] // 设置上传文件的大小限制,5mb
        ]
    };

    const policyBase64 = Base64.encode(JSON.stringify(policyText));
    return policyBase64;
}

const getSignature = function(policyBase64) {
    const accesskey = env.AccessKeySecret;

    const bytes = Crypto.HMAC(Crypto.SHA1, policyBase64, accesskey, {
        asBytes: true
    });
    const signature = Crypto.util.bytesToBase64(bytes);

    return signature;
}

module.exports = uploadFile;