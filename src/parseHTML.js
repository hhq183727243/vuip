let arr = [];
/**
* @param content 剩余内容
* @param next 下一次可能出现情况
**/
function parseHtml(content, nexts) {
    let res = null;
    for (let i = 0; i < nexts.length; i++) {
        if (typeof nexts[i] !== 'function') {
            console.error('无效参数');
        } else {
            res = nexts[i](content);

            if (res.regRes) {
                break;
            }
        }
    }

    if (!res.regRes) {
        throw new Error(`当前解析未匹配：${content}===\n`);
        // return;
    }

    let _content = content.substring(res.regRes[0].length);

    if (_content.length > 0) {
        parseHtml(_content, res.nexts);
    }
}

// 开始标签
function parseOpenTag(content) {
    let reg = /^<([\w-]+)[\s\n]*>?/;
    let regRes = content.match(reg);
    let nexts = [];

    if (regRes) {
        let tagType = 1; // 1:普通标签，3:组件, 4:内置标签（遍历）

        if (regRes[1][0] === regRes[1][0].toUpperCase()) {
            tagType = 3;
        } else if (regRes[1].substring(0, 2) === 'v-') {
            tagType = 4;
        }
        arr.push({
            type: 'startTag',
            tagName: regRes[1],
            tagType  // 判断是否是组件
        });

        if (regRes[0].indexOf('>') > -1) {
            nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];
        } else {
            nexts = [parseAttr, parseCloseTag];
        }
    }

    return { regRes, nexts };
}

// 开始标签结束
function parseOpenTagEnd(content) {
    let reg = /^>{1}/;
    let regRes = content.match(reg);
    let nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];

    return { regRes, nexts };
}

// 闭合标签
function parseCloseTag(content) {
    let reg = /^<\/([\w-]+)>|^\/>{1}/;
    let regRes = content.match(reg);
    let nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];

    if (regRes) {
        arr.push({
            type: 'endTag',
            tagName: regRes[1],
        });
    }

    return { regRes, nexts };
}

// 属性
function parseAttr(content) {
    let reg = /^([\w-:@]+)="([^"]*)"\s*|^([\w-:]+)\s*/;
    let regRes = content.match(reg);
    let nexts = [parseAttr, parseOpenTagEnd, parseCloseTag];

    if (regRes) {
        arr.push({
            type: 'attr',
            name: regRes[1] || regRes[3],
            value: regRes[2]
        });
    }

    return { regRes, nexts };
}

// 文本
function parseText(content) {
    let reg = /(^[^<>][^<>]*)/; // 第一个字符不是<|>,且后面字符不包含<|>
    let regRes = content.match(reg);
    let nexts = [parseAnnotation, parseOpenTag, parseCloseTag];

    if (regRes && regRes[1].replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: regRes[1],
        });
    }

    return { regRes, nexts };
}

// 注释annotation
function parseAnnotation(content) {
    let reg = /(^<!\-\-[\s\S]*?\-\->)/; // 第一个字符不是<|>,且后面字符不包含<|>
    let regRes = content.match(reg);
    let nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];

    /*  if (regRes && regRes[1].replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: regRes[1],
        });
    } */

    return { regRes, nexts };
}


let stack = [];
let currentStack = null;
let virtualTree = null;
function createVirtualTree(sliceArr) {
    sliceArr.forEach(item => {
        currentStack = stack[0];

        if (!currentStack && virtualTree) {
            console.error('所有内容必须包含在一个标签内');
            return;
        }

        switch (item.type) {
            case 'startTag':
                const tagNode = {
                    type: item.tagType,
                    tagName: item.tagName,
                    attr: {}
                };

                stack.unshift(tagNode);

                if (!currentStack && !virtualTree) {
                    virtualTree = tagNode
                } else {
                    if (!currentStack.children) {
                        currentStack.children = []
                    }

                    currentStack.children.push(tagNode);
                }
                break;
            case 'attr':
                currentStack.attr[item.name] = item.value === undefined ? true : item.value;
                break;
            case 'text':
                if (!currentStack.children) {
                    currentStack.children = []
                }
                currentStack.children.push({
                    type: 2,
                    content: item.content
                });
                break;
            case 'endTag':
                if (currentStack.tagName !== item.tagName && item.tagName) {
                    console.error(currentStack.tagName + '==' + item.tagName + '闭合标签错误');
                } else {
                    stack.splice(0, 1);
                }
                break;
        }
    });

    if (stack.length !== 0) {
        console.error('标签解析未完成');
    }
}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

export default function (html) {
    arr = [];
    stack = [];
    currentStack = null;
    virtualTree = null;

    parseHtml(trim(html), [parseOpenTag]);
    createVirtualTree(arr);
    return virtualTree
};