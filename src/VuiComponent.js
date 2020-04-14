import diff, { updateDom } from './VuiDiff.js';
import VuiFunc from './VuiFunc.js';
import parseHTML from './parseHTML';

const UNCREATED = 'UNCREATED';
const CREATED = 'CREATED';
const componentCache = {};
const EVENTS = ['onclick', 'onchange', 'onscroll'];

let cid = 0;

function parseFun(value) {
    if (!value) {
        throw new Error('事件绑定错误');
    }

    const reg = /^(\w+)\s*\(?\s*([\w,\.\s]*)\s*\)?$/;
    const regRes = value.match(reg);
    const name = regRes[1];
    const params = regRes[2];

    return {
        name,
        params
    }
}

// v-if v-elseif 系列中只要之前条件满足一个，之后都不渲染
let conditions = [];
/**
 * 构建创建dom代码
 * @param option 当前节点配置
 * @param prevOption 上一个节点,用来处理v-if, v-elseif, v-else指令
 */
function createCode(option, prevOption) {
    const { type, content, tagName, attr = {}, children } = option;
    const childCode = [];

    (children || []).forEach((item, index) => {
        childCode.push(createCode(item, index > 0 ? children[index - 1] : null));
    });

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
                _attrStr += `"${key}": "${attr[key]}",`; // 否则是字符串
            }
        }
    });
    _attrStr += '}';
    _eventStr = _eventStr !== '' ? ('{' + _eventStr + '}') : '';
    let _objStr = '{"attrs": ' + _attrStr + (_eventStr !== '' ? (', "on": ' + _eventStr) : '') + '}';

    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots()';
        } else {
            return `createElement("${tagName}", ${_objStr},[${childCode.join(',')}])`;
        }
    } else if (type === 2) {
        // 文本节点
        return `createElement(undefined, null, ${textParse(content.replace(/\r\n|\r|\n/g, ''))})`;
    } else if (type === 3) {
        // 组件
        return `createComponent("${tagName}", ${_attrStr},[${childCode.join(',')}], __option__)`;
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
                    code = `getFor(${data}, function(${item},${index}){ return ${childCode[0]}; }, __option__)`;
                } else {
                    throw new Error('v-for 标签下只能有一个标签节点');
                }
                break;
            case 'v-while':
                // v-while 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = `getFor(${data}, function(${item},${index}){ return getIf(${test}, function(){ return ${childCode[0]};})}, __option__)`;
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
                    code = `getIf(${test}, function(){ return ${childCode[0]};})`;
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
                    conditions.push(prevOption.attr.test);
                    code = `getElseIf([${conditions.join(',')}], ${tagName === 'v-elseif' ? test : true}, function(){ return ${childCode[0]};})`;
                } else {
                    throw new Error('v-elseif/else 标签下只能有一个标签节点');
                }
                break;
            default: code = ''; break;
        }
        return code;
    }
}

// 文本解析
function textParse(text) {
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

function createFunction(code) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}

const Lifecycle = {
    // new Vui 后第一个执行的钩子函数
    willCreate() {

    },
    created(){

    },
    willMount(){

    },
    // 装载结束
    mounted() {
        console.log('mounted');
    },
    // 将要更新
    willUpdate() {
        console.log('willUpdate');
    },
    // 更新结束
    updated() {
        // console.log('updated');
    },
    // 将要卸载
    willUnmount() {
        console.log('willUnmount');
    },
    // 卸载结束
    unmounted() {
        console.log('unmounted');
    }
}

function h(html) {
    return new VuiComponent(parseHTML(html));
}

/**
 * @param $parent 父组件实例
 * @param config 组件配置
 * @param props 来自父组件参数
 * @param $slots 组件插槽
*/
export default class VuiComponent {
    constructor({ $parent, config, props = {}, $slots }) {
        this.cid = cid++;
        this.config = Object.assign({
            methods: {},
            data() { return {} }
        }, Lifecycle, config);
        this.config.willCreate.bind(this)();
        this.componentName = this.config.name;
        this.$el = null;
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.props = props;
        this.componentState = UNCREATED; // 组件状态
        this._data = this.config.data() || {};

        for (let funName in this.config.methods) {
            this[funName] = this.config.methods[funName];
        }

        this._init();
    }
    _init() {
        this._proxyData(this._data);
        const code = createCode(this.config.ast || this.config.render(parseHTML, this));
        this.$render = createFunction(code);
        this.$vNode = this._renderVnode();

        // 将组件dom缓存起来
        componentCache[this.cid] = this;

        // 自定义组件
        new Promise((resolve, reject) => {
            resolve();
        }).then(() => {
            if (typeof this.config.mounted === 'function' && this.componentState === UNCREATED) {
                this.componentState = CREATED;
                this.config.mounted.call(this);
            }
        });
    }
    _proxyData(data) {
        this.data = new Proxy(data, {
            get: (target, key, proxy) => {
                if (typeof (target[key]) === 'function') {
                    return target[key].bind(this)();
                }

                return target[key];
            },
            set: (target, key, value, proxy) => {
                throw new Error(`VUI 不允许直接对data赋值，否则可能会引起一些未知异常`);
            }
        });
    }
    _reRender() {
        // 当组件参数由render函数返回时，需每次都需要重新执行render函数
        if (typeof (this.config.render) === 'function') {
            const code = createCode(this.config.ast || this.config.render(parseHTML, this));
            this.$render = createFunction(code);
        }

        const $newVNode = this._renderVnode({
            update: true
        });

        const patches = diff(this.$vNode, $newVNode);

        if (patches.length) {
            // console.log(patches);
            updateDom(patches);

            if (typeof this.config.updated === 'function') {
                this.config.updated.call(this);
            }
        }
    }
    _renderVnode(option = {}) {
        const methods = {};

        Object.keys(this.config.methods).forEach(functionName => {
            // 绑定methods作用域
            methods[functionName] = this.config.methods[functionName].bind(this);
        });


        // 如果data中属性值是function则说明该属性为计算属性
        return this.$render.call({
            ...VuiFunc,
            props: this.props,
            state: (this.$store || {}).state,
            $vuip: this,
            ...this.data,
            ...methods
        }, {
            update: false,
            ...option
        });
    }
    // 更新数据
    setData(updateData = {}, callback) {
        this.renderEnd = false;

        for (let key in updateData) {
            this._data[key] = updateData[key];
        }

        // renderEnd 防止在一个事件循环中多次调用setData导致重复渲染
        new Promise((resolve) => {
            resolve();
        }).then(() => {
            if (!this.renderEnd) {
                this._reRender();
                this.renderEnd = true;
                callback && callback();
            }
        });
    }
    // 组件卸载
    uninstall() {
        if (this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
        this.config.willUnmount.call(this);
        this.config.unmounted.call(this);

        // 从$parent的$children中删除已卸载组件
        let index = null;
        this.$parent.$children.forEach((item, i) => {
            if (item === this) {
                index = i;
            }
        });
        if (index !== null) {
            this.$parent.$children.splice(index, 1);
        }

        // 子组件卸载
        this.$children.forEach(comp => {
            comp.uninstall();
        });
    }
}
