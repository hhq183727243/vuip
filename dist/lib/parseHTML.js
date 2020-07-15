"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var selfClosingTag = ['input', 'img', 'br', 'hr', 'source', 'keygen', 'embed', 'object', 'param', 'area', 'link', 'frame', 'col'];
/**
* @param content 剩余内容
* @param next 下一次可能出现情况
**/
function parseHtml(content, nexts) {
    var res = null;
    for (var i = 0; i < nexts.length; i++) {
        if (typeof nexts[i] !== 'function') {
            console.error('无效参数');
        }
        else {
            res = nexts[i](content);
            if (res.regRes) {
                break;
            }
        }
    }
    if (!res || !res.regRes) {
        throw new Error("\u5F53\u524D\u89E3\u6790\u672A\u5339\u914D\uFF1A" + content + "===\n");
    }
    else {
        var _content = content.substring(res.regRes[0].length);
        if (_content.length > 0) {
            // parseHtml(_content, res.nexts);
            return {
                content: _content,
                nexts: res.nexts
            };
        }
    }
    return null;
}
var prevTag;
// 开始标签
function parseOpenTag(content) {
    var reg = /^<([\w-]+)[\s\n]*>?/;
    var regRes = content.match(reg);
    var nexts = [];
    if (regRes) {
        // 在匹配下一个开始标签前，先判断上一个开始标签是否是自闭合标签
        if (selfClosingTag.includes(prevTag)) {
            arr.push({
                type: 'endTag',
                tagName: prevTag,
            });
        }
        var tagType = 1; // 1:普通标签，3:组件, 4:内置标签（遍历）
        if (regRes[1][0] === regRes[1][0].toUpperCase()) {
            tagType = 3;
        }
        else if (regRes[1].substring(0, 2) === 'v-') {
            tagType = 4;
        }
        arr.push({
            type: 'startTag',
            tagName: regRes[1],
            tagType: tagType // 判断是否是组件
        });
        prevTag = regRes[1];
        if (regRes[0].indexOf('>') > -1) {
            nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];
        }
        else {
            nexts = [parseAttr, parseCloseTag];
        }
    }
    return { regRes: regRes, nexts: nexts };
}
// 开始标签结束
function parseOpenTagEnd(content) {
    var reg = /^>{1}/;
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];
    return { regRes: regRes, nexts: nexts };
}
// 闭合标签
function parseCloseTag(content) {
    var reg = /^<\/([\w-]+)>|^\/>{1}/;
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];
    if (regRes) {
        // 在匹配下一个闭合标签前，先判断上一个开始标签是否是自闭合标签
        if (regRes[1] && regRes[1] !== prevTag && selfClosingTag.includes(prevTag)) {
            arr.push({
                type: 'endTag',
                tagName: prevTag,
            });
        }
        arr.push({
            type: 'endTag',
            tagName: regRes[1],
        });
        prevTag = '';
    }
    return { regRes: regRes, nexts: nexts };
}
// 属性
function parseAttr(content) {
    var reg = /^([\w-:@]+)="([^"]*)"\s*|^([\w-:]+)\s*/;
    var regRes = content.match(reg);
    var nexts = [parseAttr, parseOpenTagEnd, parseCloseTag];
    if (regRes) {
        arr.push({
            type: 'attr',
            name: regRes[1] || regRes[3],
            value: regRes[2]
        });
    }
    return { regRes: regRes, nexts: nexts };
}
// 文本
function parseText(content) {
    var reg = /(^[^<>][\s\S]*?(<\/?\w|<!--)){1}/;
    ; // 第一个字符不是<|>,且后面字符不包含<|>
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseOpenTag, parseCloseTag];
    var text = '';
    if (regRes && regRes[1]) {
        // const nextTagStr = regRes[2]; // {list.length > 1 ? 2 : 1} < a</div> 当遇到<a 或 </a类型时说明文本匹配结束
        text = regRes[1].substring(0, regRes[1].length - regRes[2].length);
        regRes[0] = text;
    }
    if (text.replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: text,
        });
    }
    return { regRes: regRes, nexts: nexts };
}
// 注释annotation
function parseAnnotation(content) {
    var reg = /(^<!\-\-[\s\S]*?\-\->)/;
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];
    /*  if (regRes && regRes[1].replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: regRes[1],
        });
    } */
    return { regRes: regRes, nexts: nexts };
}
function createVirtualTree(sliceArr) {
    var stack = [];
    var currentStack;
    var virtualTree = stack[0];
    sliceArr.forEach(function (item) {
        currentStack = stack[0];
        if (!currentStack && virtualTree) {
            console.error('所有内容必须包含在一个标签内');
            return;
        }
        switch (item.type) {
            case 'startTag':
                var tagNode = {
                    type: item.tagType || 1,
                    tagName: item.tagName || '',
                    attr: {}
                };
                stack.unshift(tagNode);
                if (!currentStack && !virtualTree) {
                    virtualTree = tagNode;
                }
                else {
                    if (!currentStack.children) {
                        currentStack.children = [];
                    }
                    currentStack.children.push(tagNode);
                }
                break;
            case 'attr':
                if (currentStack.attr && item.name) {
                    currentStack.attr[item.name] = item.value === undefined ? true : item.value;
                }
                break;
            case 'text':
                if (!currentStack.children) {
                    currentStack.children = [];
                }
                currentStack.children.push({
                    type: 2,
                    content: item.content
                });
                break;
            case 'endTag':
                if (currentStack.tagName !== item.tagName && item.tagName) {
                    console.error(currentStack.tagName + '==' + item.tagName + '闭合标签错误');
                }
                else {
                    stack.splice(0, 1);
                }
                break;
            default:
                console.error('html 模板解析异常');
                break;
        }
    });
    if (stack.length !== 0) {
        console.error('标签解析未完成');
    }
    return virtualTree;
}
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
var arr = [];
function default_1(html) {
    arr = [];
    // 解决标签太多时导致堆栈溢出问题
    var res = {
        content: trim(html),
        nexts: [parseOpenTag]
    };
    while (res) {
        res = parseHtml(res.content, res.nexts);
    }
    return createVirtualTree(arr);
}
exports.default = default_1;
;
