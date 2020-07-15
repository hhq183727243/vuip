"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EVENTS = [
    'onclick', 'ondblclick',
    'ondrag', 'ondragstart', 'ondragenter', 'ondragleave', 'ondragover', 'ondragend',
    'onkeydown', 'onkeypress', 'onkeyup',
    'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove', 'onmouseout', 'onmousewheel',
    'onchange', 'oninput', 'onblur', 'onfocus', 'onreset', 'onsubmit', 'onselect',
    'onresize', 'onscroll'
];
// 文本解析
function textParse(text) {
    // 匹配{ }里面内容
    var reg = /\{\s*((?!\{|\}).+?)\s*\}/g;
    var originText = text;
    var result;
    while ((result = reg.exec(originText)) !== null) {
        text = text.replace(result[0], "\" + (" + result[1] + ") + \"");
    }
    // 拼接成："字符串" + name + "字符串";
    return '"' + text + '"';
}
function parseFun(value) {
    if (value === '') {
        throw new Error('事件绑定错误');
    }
    var name = '';
    var params = '';
    var hasParams = false;
    var reg = /^(\w+)\s*$/;
    if (value.indexOf('(') > -1) {
        hasParams = true;
        reg = /^(\w+)\s*\(\s*(.*)\s*\)$/;
    }
    var regRes = value.match(reg);
    if (regRes) {
        name = regRes[1];
        params = hasParams ? regRes[2] : '';
    }
    return {
        name: name,
        params: params
    };
}
/**
 * 构建创建dom代码
 * @param option 当前节点配置
 * @param prevOption 上一个节点,用来处理v-if, v-elseif, v-else指令
 * @param conditions v-if v-elseif 系列中只要之前条件满足一个，之后都不渲染
 */
function createCode(option, prevOption, conditions) {
    var type = option.type, content = option.content, tagName = option.tagName, _a = option.attr, attr = _a === void 0 ? {} : _a, children = option.children;
    var childCode = [];
    var p_conditions = []; // 保证同一个children共享一个condition
    if (children) {
        children.forEach(function (item, index) {
            childCode.push(createCode(item, index > 0 ? children[index - 1] : null, p_conditions));
        });
    }
    var _attrStr = '{';
    var _eventStr = '';
    Object.keys(attr).forEach(function (key, index) {
        if (EVENTS.includes(key)) {
            var _a = parseFun(attr[key]), name_1 = _a.name, params = _a.params;
            _eventStr += "\"" + key.replace('on', '') + "\": function($event){ return " + name_1 + "(" + (params !== '' ? (params + ',') : '') + "$event)},";
        }
        else if (key === 'v-model' && type === 1) {
            // 普通标签v-model指令，直接监听input事件
            _eventStr += "\"input\": function($event){ " + attr[key] + "=$event.target.value; },";
        }
        else if (key === 'v-model' && type === 3) {
            // 组件v-model指令，需要主动执行emit('input')来触发父组件value更新
            _attrStr += "\"input\": function(_v){ " + attr[key] + "=_v; },";
            _attrStr += "\"value\": " + attr[key] + ",";
        }
        else if (key.indexOf('v-on:') === 0 && type === 3) {
            // 父子组件通信
            var _b = parseFun(attr[key]), name_2 = _b.name, params = _b.params;
            _attrStr += "\"" + key.replace(/^v-on:?/, '') + "\": function(a,b,c,d,e,f){ return " + name_2 + "(" + (params !== '' ? (params + ',') : '') + "a,b,c,d,e,f)},"; // :开头说明是表达式
        }
        else {
            if (key.indexOf(':') === 0) {
                _attrStr += "\"" + key.replace(/^:?/, '') + "\": " + attr[key] + ","; // :开头说明是表达式
            }
            else {
                if (typeof attr[key] === 'string') {
                    _attrStr += "\"" + key + "\": \"" + attr[key].replace(/\r\n|\r|\n/g, ' ') + "\","; // 字符串
                }
                else {
                    _attrStr += "\"" + key + "\": " + attr[key] + ","; // boolean 值
                }
            }
        }
    });
    _attrStr += '}';
    _eventStr = _eventStr !== '' ? ('{' + _eventStr + '}') : '';
    var _objStr = '{"attrs": ' + _attrStr + (_eventStr !== '' ? (', "on": ' + _eventStr) : '') + '}';
    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots($vuip)';
        }
        else {
            return "createElement(\"" + tagName + "\", " + _objStr + ", [" + childCode.join(',') + "], $vuip)";
        }
    }
    else if (type === 2) {
        // 文本节点
        if (content) {
            return "createElement(undefined, null, " + textParse(content.replace(/\r\n|\r|\n/g, '')) + ", $vuip)";
        }
        return '';
    }
    else if (type === 3) {
        // 组件
        return "createComponent(\"" + tagName + "\", " + _objStr + ",[" + childCode.join(',') + "], $vuip, __option__)";
    }
    else if (type === 4) {
        // 指令
        var code = '';
        var _b = attr.data, data = _b === void 0 ? [] : _b, test = attr.test, _c = attr.item, item = _c === void 0 ? 'item' : _c, _d = attr.index, index = _d === void 0 ? 'index' : _d;
        switch (tagName) {
            case 'v-for':
                // v-for 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                }
                else if (children.length === 1) {
                    code = "getFor(" + data + ", function(" + item + "," + index + "){ return " + childCode[0] + "; }, $vuip, __option__)";
                }
                else {
                    throw new Error('v-for 标签下只能有一个标签节点');
                }
                break;
            case 'v-while':
                // v-while 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                }
                else if (children.length === 1) {
                    code = "getFor(" + data + ", function(" + item + "," + index + "){ return getIf(" + test + ", function(){ return " + childCode[0] + ";}, $vuip)}, $vuip, __option__)";
                }
                else {
                    throw new Error('v-while 标签下只能有一个标签节点');
                }
                break;
            case 'v-if':
                // v-if 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                }
                else if (children.length === 1) {
                    // 重置if、else条件集合
                    conditions.length = 0;
                    code = "getIf(" + test + ", function(){ return " + childCode[0] + ";}, $vuip)";
                }
                else {
                    throw new Error('v-if 标签下只能有一个标签节点');
                }
                break;
            case 'v-elseif':
            case 'v-else':
                if (!prevOption || (prevOption.tagName !== 'v-if' && prevOption.tagName !== 'v-elseif')) {
                    throw new Error('v-elseif/else 标签下只能在v-if 或 v-elseif标签之后');
                }
                // v-elseif 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                }
                else if (children.length === 1) {
                    if (prevOption.attr) {
                        conditions.push(prevOption.attr.test);
                    }
                    code = "getElseIf([" + conditions.join(',') + "], " + (tagName === 'v-elseif' ? test : true) + ", function(){ return " + childCode[0] + ";}, $vuip)";
                }
                else {
                    throw new Error('v-elseif/else 标签下只能有一个标签节点');
                }
                break;
            default:
                code = '';
                break;
        }
        return code;
    }
    return '';
}
exports.default = createCode;
