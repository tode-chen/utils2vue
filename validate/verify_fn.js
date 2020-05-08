export function verifyData(pageThis, name) {
    var rules = pageThis['rules'],
        rule,
        rst = true
    if (name) {
        rst = handleVerify(rules[name], pageThis[name])
    } else {
        for (let key in rules) {
            rst = handleVerify(rules[key], pageThis[key])
            if (!rst) break
        }
    }
    return rst;
    function handleVerify(items, value) {
        var type
        for (let i = 0; i < items.length; i++) {
            rule = items[i];
            type = rule['type'] || ''
            if (rule.required && rule.required === true) {
                if (isEmpty(value)) {
                    error();
                    return false;
                }
            }
            if (rule.min || rule.max) {
                if (rule.min > 0) {
                    if (calCount(value) < rule.min) {
                        error();
                        return false;
                    }
                }
                if (rule.max > 0) {
                    if (calCount(value) > rule.max) {
                        error();
                        return false;
                    }
                }
            }
            if (type) {
                if (type == "Array") {
                    if (isEmpty(value)) {
                        error();
                        return false;
                    }
                }
                if (type == "Date") {
                    if (
                        new Date(value).getDate() != value.substring(value.length - 2)
                    ) {
                        error();
                        return false;
                    }
                }
                if (type === "idCard") {
                    // 验证合法身份证
                    if (!IdentityCodeValid(value)) {
                        error();
                        return false;
                    }
                }
                if (type === "mobile") {
                    // 验证合法手机号码
                    if (!isPoneAvailable(value)) {
                        error(rule.typeMessage);
                        return false;
                    }
                }
                if (type === "number") {
                    // 验证数字类型
                    if (typeof value !== 'number') {
                        error();
                        return false;
                    }
                }
                if (type === "name") {
                    // 验证中文姓名
                    if (!verify_realname(value)) {
                        error();
                        return false;
                    }
                }
                if (type === "positiveInteger") {
                    // 验证正整数
                    if (!verify_positiveInteger(value)) {
                        error();
                        return false;
                    }
                }
                if (type === "nonnegative") {
                    // 验证非负数
                    if (!verify_nonnegative(value)) {
                        error();
                        return false;
                    }
                }
            }
        }
        return true
        function error(message) {
            var msg = message || rule.message
            uni.showToast({
                title: msg,
                duration: 2000,
                icon: 'none'
            });
        }
    }
}
// 是否为空
export function isEmpty(obj) {
    // [object Array] / [object Object]
    // [object Undefined] [object Null] [object Function] / [object Number] [object Boolean] / [object String]
    var temp = obj;
    var gettype = Object.prototype.toString;
    var type = gettype.call(temp);
    // console.log("the obj is " + type, temp);
    if (
        type == "[object Undefined]" ||
        type == "[object Null]" ||
        type == "[object Function]"
    ) {
        return true;
    } else if (type == "[object Number]" || type == "[object Boolean]") {
        return false;
    } else if (
        type == "[object Array]" ||
        type == "[object Object]" ||
        type == "[object String]"
    ) {
        var temp = type == "[object Object]" ? Object.keys(temp) : temp;
        if (temp.length > 0) {
            return false;
        } else {
            return true;
        }
    } else {
        console.log("未知类型对象");
        return "未知类型对象";
    }
}
// 统计字数
export function calCount(str) {
    let that = this;
    var Words = str;
    var W = new Object();
    var Result = new Array();
    var iNumwords = 0;
    var sNumwords = 0;
    var sTotal = 0; //双字节字符;
    var iTotal = 0; //中文字符；
    var eTotal = 0; //Ｅ文字符
    var otherTotal = 0;
    var bTotal = 0;
    var inum = 0;
    for (var i = 0; i < Words.length; i++) {
        var c = Words.charAt(i);
        if (c.match(/[\u4e00-\u9fa5]/)) {
            if (isNaN(W[c])) {
                iNumwords++;
                W[c] = 1;
            }
            iTotal++;
        }
    }

    for (i = 0; i < Words.length; i++) {
        var c = Words.charAt(i);
        if (c.match(/[^\x00-\xff]/)) {
            if (isNaN(W[c])) {
                sNumwords++;
            }
            sTotal++;
        } else {
            eTotal++;
        }
        if (c.match(/[0-9]/)) {
            inum++;
        }
    }
    var count_temp = iTotal * 2 + (sTotal - iTotal) * 2 + eTotal;
    return count_temp;
}
// 简单验证手机号
export function isPoneAvailable(obj) {
    var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (!reg.test(obj)) {
        return false;
    } else {
        return true;
    }
}
// 简单验证身份证
export function IdentityCodeValid(obj) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!reg.test(obj)) {
        return false;
    } else {
        return true;
    }
}
// 验证正式姓名
export function verify_realname(obj) {
    var reg = /^[\u4e00-\u9fa5]{2,17}$/;
    if (!reg.test(obj)) {
        return false;
    } else {
        return true;
    }
}
