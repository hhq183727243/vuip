import { AstOptions } from './interface';
const selfClosingTag: string[] = ['input', 'img', 'br', 'hr', 'source', 'keygen', 'embed', 'object', 'param', 'area', 'link', 'frame', 'col']
interface Ast {
    type: string;
    tagName?: string;
    tagType?: number;
    content?: string;
    name?: string;
    value?: string;
}

type FunArr = ((contetn: string) => Res)[];

interface Res {
    regRes: any,
    nexts: FunArr
}

/**
* @param content 剩余内容
* @param next 下一次可能出现情况
**/
function parseHtml(content: string, nexts: FunArr) {
    let res = null;
    for (let i: number = 0; i < nexts.length; i++) {
        if (typeof nexts[i] !== 'function') {
            console.error('无效参数');
        } else {
            res = nexts[i](content);

            if (res.regRes) {
                break;
            }
        }
    }

    if (!res || !res.regRes) {
        throw new Error(`当前解析未匹配：${content}===\n`);
    } else {
        let _content = content.substring(res.regRes[0].length);

        if (_content.length > 0) {
            parseHtml(_content, res.nexts);
        }
    }
}

let prevTag: string;

// 开始标签
function parseOpenTag(content: string): Res {
    let reg: RegExp = /^<([\w-]+)[\s\n]*>?/;
    let regRes = content.match(reg);
    let nexts: FunArr = [];

    if (regRes) {
        // 在匹配下一个开始标签前，先判断上一个开始标签是否是自闭合标签
        if (selfClosingTag.includes(prevTag)) {
            arr.push({
                type: 'endTag',
                tagName: prevTag,
            });
        }

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

        prevTag = regRes[1];

        if (regRes[0].indexOf('>') > -1) {
            nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];
        } else {
            nexts = [parseAttr, parseCloseTag];
        }
    }

    return { regRes, nexts };
}

// 开始标签结束
function parseOpenTagEnd(content: string): Res {
    let reg: RegExp = /^>{1}/;
    let regRes: any = content.match(reg);
    let nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];

    return { regRes, nexts };
}

// 闭合标签
function parseCloseTag(content: string): Res {
    let reg: RegExp = /^<\/([\w-]+)>|^\/>{1}/;
    let regRes: any = content.match(reg);
    let nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];

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

    return { regRes, nexts };
}

// 属性
function parseAttr(content: string): Res {
    let reg: RegExp = /^([\w-:@]+)="([^"]*)"\s*|^([\w-:]+)\s*/;
    let regRes: any = content.match(reg);
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
function parseText(content: string): Res {
    let reg: RegExp = /(^[^<>][\s\S]*?(<\/?\w|<!--)){1}/;; // 第一个字符不是<|>,且后面字符不包含<|>
    let regRes = content.match(reg);
    let nexts: FunArr = [parseAnnotation, parseOpenTag, parseCloseTag];
    let text: string = '';

    if (regRes && regRes[1]) {
        // const nextTagStr = regRes[2]; // {list.length > 1 ? 2 : 1} < a</div> 当遇到<a 或 </a类型时说明文本匹配结束
        text = regRes[1].substring(0, regRes[1].length - regRes[2].length);
        regRes[0] = text
    }

    if (text.replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: text,
        });
    }

    return { regRes, nexts };
}

// 注释annotation
function parseAnnotation(content: string): Res {
    let reg: RegExp = /(^<!\-\-[\s\S]*?\-\->)/;
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

function createVirtualTree(sliceArr: Ast[]): AstOptions {
    let stack: AstOptions[] = [];
    let currentStack: AstOptions;
    let virtualTree: AstOptions = stack[0];

    sliceArr.forEach(item => {
        currentStack = stack[0];

        if (!currentStack && virtualTree) {
            console.error('所有内容必须包含在一个标签内');
            return;
        }

        switch (item.type) {
            case 'startTag':
                const tagNode: AstOptions = {
                    type: item.tagType || 1,
                    tagName: item.tagName || '',
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
                if (currentStack.attr && item.name) {
                    currentStack.attr[item.name] = item.value === undefined ? true : item.value;
                }
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
            default:
                console.error('html 模板解析异常');
                break
        }
    });

    if (stack.length !== 0) {
        console.error('标签解析未完成');
    }

    return virtualTree;
}

function trim(str: string): string {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

let arr: Ast[] = [];
export default function (html: string): AstOptions {
    arr = [];
    parseHtml(trim(html), [parseOpenTag]);
    return createVirtualTree(arr)
};