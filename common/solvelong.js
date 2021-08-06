export var solvelong = {
    getRealJsonData(baseStr) {
        if (!baseStr || typeof baseStr != 'string') return;
        var jsonData = null;
        try {
            jsonData = JSON.parse(baseStr);
        } catch (err) {
            return null;
        }
        var needReplaceStrs = [];
        console.log("basestr", baseStr, "jsondata", jsonData)
        this.loopFindArrOrObj(jsonData, needReplaceStrs);
        console.log("needReplaceStrs", needReplaceStrs)
        needReplaceStrs.forEach((replaceInfo) => {
            // var matchArr = baseStr.match(eval('/"' + replaceInfo.key + '":[0-9]{15,}/')); 
            let regexp = new RegExp("\"" + replaceInfo.key + "\"" + ":[0-9]{15,}") //小程序不支持eval
            let matchArr = baseStr.match(regexp)
            console.log("matchArr", matchArr)
            if (matchArr) {
                var str = matchArr[0];
                //找到后在前后加上双引号
                var replaceStr = str.replace('"' + replaceInfo.key + '":', '"' + replaceInfo.key + '":"');
                replaceStr += '"';
                baseStr = baseStr.replace(str, replaceStr);
            }
        })
        var returnJson = null;
        console.log("basestr", baseStr)
        try {
            returnJson = JSON.parse(baseStr);
        } catch (err) {
            return null;
        }
        console.log("returnJson", returnJson)
        return returnJson;
    },

    /**
     * 遍历对象类型的
     */
    getNeedRpStrByObj(obj, needReplaceStrs) {
        for (var key in obj) {
            var value = obj[key];
            // 大于这个数说明精度会丢失! 
            if (typeof value == 'number' && value > 9007199254740992) {
                needReplaceStrs.push({ key: key });
            }
            this.loopFindArrOrObj(value, needReplaceStrs);
        }
    },

    /**
     * 判断数组类型
     */
    getNeedRpStrByArr(arr, needReplaceStrs) {
        for (var i = 0; i < arr.length; i++) {
            var value = arr[i];
            this.loopFindArrOrObj(value, needReplaceStrs);
        }
    },
    /**
     * 递归遍历
     */
    loopFindArrOrObj(value, needRpStrArr) {
        var valueTypeof = Object.prototype.toString.call(value);
        if (valueTypeof == '[object Object]') {
            needRpStrArr.concat(this.getNeedRpStrByObj(value, needRpStrArr));
        }
        if (valueTypeof == '[object Array]') {
            needRpStrArr.concat(this.getNeedRpStrByArr(value, needRpStrArr));
        }
    }
}