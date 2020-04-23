import { AstOptions } from './interface';

const EVENTS = ['onclick', 'onchange', 'onscroll'];

// 文本解析
function textParse(text: string): string {
    // 匹配{ }里面内容
    const reg = /\{\s*([\(\),\w\.:\?\+\-\*\/\s'"=!<>]+)\s*\}/g;
    const originText = text;
    let result;

    while ((result = reg.exec(originText)) !== null) {
        text = text.replace(result[0], `" + (${result[1]}) + "`);
    }

    // 拼接成："字符串" + name + "字符串";
    return '"' + text + '"';
}

function parseFun(value: string): { name: string, params: string } {
    if (value === '') {
        throw new Error('事件绑定错误');
    }
    let name: string = '';
    let params: string = '';
    const reg = /^(\w+)\s*\(?\s*([\w,\.\s]*)\s*\)?$/;
    const regRes = value.match(reg);

    if (regRes) {
        name = regRes[1];
        params = regRes[2];
    }

    return {
        name,
        params
    }
}

// v-if v-elseif 系列中只要之前条件满足一个，之后都不渲染
let conditions: string[] = [];
/**
 * 构建创建dom代码
 * @param option 当前节点配置
 * @param prevOption 上一个节点,用来处理v-if, v-elseif, v-else指令
 */
function createCode(option: AstOptions, prevOption: AstOptions | null): string {
    const { type, content, tagName, attr = {}, children } = option;
    const childCode: string[] = [];

    if (children) {
        children.forEach((item: AstOptions, index: number) => {
            childCode.push(createCode(item, index > 0 ? children[index - 1] : null));
        });
    }


    let _attrStr = '{';
    let _eventStr = '';
    Object.keys(attr).forEach((key, index) => {
        if (EVENTS.includes(key)) {
            const { name, params } = parseFun(attr[key]);
            _eventStr += `"${key.replace('on', '')}": function($event){ return this.${name}(${/\w/.test(params) ? (params + ',') : ''}$event)},`;
        } else if (key.indexOf('v-on:') === 0 && type === 3) {
            // 父子组件通信
            const { name, params } = parseFun(attr[key]);
            _attrStr += `"${key.replace(/^v-on:?/, '')}": function(a,b,c,d,e,f){ return $vuip.${name}(${/\w/.test(params) ? (params + ',') : ''}a,b,c,d,e,f)},`; // :开头说明是表达式
        } else {
            if (key.indexOf(':') === 0) {
                _attrStr += `"${key.replace(/^:?/, '')}": ${attr[key]},`; // :开头说明是表达式
            } else {
                _attrStr += `"${key}": "${attr[key].replace(/\r\n|\r|\n/g, ' ')}",`; // 否则是字符串
            }
        }
    });
    _attrStr += '}';
    _eventStr = _eventStr !== '' ? ('{' + _eventStr + '}') : '';
    let _objStr = '{"attrs": ' + _attrStr + (_eventStr !== '' ? (', "on": ' + _eventStr) : '') + '}';

    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots($vuip)';
        } else {
            return `createElement("${tagName}", ${_objStr}, [${childCode.join(',')}], $vuip)`;
        }
    } else if (type === 2) {
        // 文本节点
        if (content) {
            return `createElement(undefined, null, ${textParse(content.replace(/\r\n|\r|\n/g, ''))}, $vuip)`;
        }
        return '';
    } else if (type === 3) {
        // 组件
        return `createComponent("${tagName}", ${_attrStr},[${childCode.join(',')}], $vuip, __option__)`;
    } else if (type === 4) {
        // 指令
        let code = '';
        const { data = [], test, item = 'item', index = 'index' } = attr;
        switch (tagName) {
            case 'v-for':
                // v-for 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = `getFor(${data}, function(${item},${index}){ return ${childCode[0]}; }, $vuip, __option__)`;
                } else {
                    throw new Error('v-for 标签下只能有一个标签节点');
                }
                break;
            case 'v-while':
                // v-while 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = `getFor(${data}, function(${item},${index}){ return getIf(${test}, function(){ return ${childCode[0]};}, $vuip)}, $vuip, __option__)`;
                } else {
                    throw new Error('v-while 标签下只能有一个标签节点');
                }
                break;
            case 'v-if':
                // v-if 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    // 重置if、else条件集合
                    conditions = [];
                    code = `getIf(${test}, function(){ return ${childCode[0]};}, $vuip)`;
                } else {
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
                } else if (children.length === 1) {
                    if (prevOption.attr) {
                        conditions.push(prevOption.attr.test);
                    }
                    code = `getElseIf([${conditions.join(',')}], ${tagName === 'v-elseif' ? test : true}, function(){ return ${childCode[0]};}, $vuip)`;
                } else {
                    throw new Error('v-elseif/else 标签下只能有一个标签节点');
                }
                break;
            default: code = ''; break;
        }
        return code;
    }

    return '';
}

export default createCode;