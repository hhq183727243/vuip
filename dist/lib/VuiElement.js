"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VuiComponent_1 = __importDefault(require("./VuiComponent"));
function createFnInvoker(fns, vm) {
    function invoker() {
        var arguments$1 = arguments;
        var fns = invoker.fns;
        if (Array.isArray(fns)) {
            var cloned = fns.slice();
            for (var i = 0; i < cloned.length; i++) {
                invokeWithErrorHandling(cloned[i], arguments$1, vm);
            }
        }
        else {
            // return handler return value for single handlers
            return invokeWithErrorHandling(fns, arguments, vm);
        }
    }
    invoker.remove = function () { };
    invoker.fns = fns;
    return invoker;
}
function invokeWithErrorHandling(handler, args, vm) {
    var res;
    try {
        res = args ? handler.apply(vm, args) : handler.call(vm);
    }
    catch (e) {
        console.error(e);
    }
    return res;
}
function setParentVNode(parent, children) {
    // 为子节点设置父节点
    children.forEach(function (item) {
        if (Array.isArray(item)) {
            setParentVNode(parent, item);
        }
        else {
            if (item.parentVNode === undefined) {
                item.parentVNode = parent;
            }
        }
    });
}
var uid = 0;
/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * @param context 标签所属组件上下文
 * */
var VElement = /** @class */ (function () {
    function VElement(options) {
        var tagName = options.tagName, option = options.option, children = options.children, context = options.context;
        var _a = option || {}, attrs = _a.attrs, on = _a.on;
        this.uid = uid++;
        this.parentVNode = undefined;
        this.tagName = tagName; // 标签名
        this.context = context; // dom 所在组件实例
        this.text = undefined; // 文本节点内容
        this.children = undefined; // 子节点
        this.on = on; // dom事件集合
        this.attrs = attrs; // dom属性集合
        this.events = {};
        // 如果 tagName === undefined ，则说明为文本节点，children为文本内容
        if (tagName === undefined && typeof children === 'string') {
            this.text = children;
        }
        else if (tagName === 'comment') {
            // 注释节点
            this.text = children === null || children === void 0 ? void 0 : children.toString();
        }
        else if (tagName.indexOf('component-') === 0) {
            // 子组件，则children为子组件实例
            this.child = children;
        }
        else {
            // 普通标签节点
            this.children = children;
            // 为子节点设置父节点
            setParentVNode(this, this.children);
        }
    }
    VElement.prototype.render = function (parentEl) {
        var el;
        if (this.tagName === undefined) {
            // 创建文本节点
            el = document.createTextNode(this.text);
            if (parentEl) {
                el.parentEl = parentEl;
            }
        }
        else if (this.tagName === 'comment') {
            // 创建注释节点，注释节点也是一个Dom
            el = document.createComment(this.text || 'undefined');
        }
        else if (this.tagName.indexOf('component-') === 0) {
            // 渲染子组件
            if (this.child && !(this.child instanceof VuiComponent_1.default)) {
                this.child = new VuiComponent_1.default(this.child);
                /* if (this.child.$parent) {
                    // 将组件添加到付组件实例的$children中
                    this.child.$parent.$children.push(this.child);
                } */
            }
            // 设置组件实例所对应的VElement实例2020-7-27 14:18:44
            this.child.$parentVNode = this;
            el = this.child.$el;
        }
        else {
            // 普通标签节点
            el = document.createElement(this.tagName);
        }
        // 将组件顶级节点挂载到组件实例上，用于后面组件卸载移除对应dom操作
        if (!this.context.$el) {
            this.context.$el = el;
        }
        this.elm = el; // 虚拟节点对应的DOM节点
        this.setAttrs();
        this.updateListeners();
        /* if (this.attrs && this.attrs['v-model']) {
            el.addEventListener('input', (e: Event) => {
                console.log(e);
            }, false);
        } */
        // 渲染列表
        this.renderVList(el, this.children);
        return el;
    };
    VElement.prototype.renderVList = function (parentEl, els) {
        var _this = this;
        // 处理子元素
        if (Array.isArray(els)) {
            els.forEach(function (child) {
                if (Array.isArray(child)) {
                    // v-for、slot为数组
                    child.forEach(function (_c) {
                        // 添加子元素到当前元素
                        if (Array.isArray(_c)) {
                            _this.renderVList(parentEl, _c);
                        }
                        else {
                            parentEl.appendChild(_c.render());
                        }
                    });
                }
                else {
                    // 添加子元素到当前元素
                    if (_this.attrs['v-html'] && Array.isArray(_this.children)) {
                        // 判断是否采用html渲染，如果是，则child.length === 1
                        if (_this.children && _this.children.length === 1 && child.tagName === undefined) {
                            child.render(parentEl);
                            parentEl.innerHTML = (child.text || ''); //(child.render());
                        }
                        else {
                            throw new Error('v-html 标签下只能包含一个文本标签');
                        }
                    }
                    else {
                        parentEl.appendChild(child.render());
                    }
                }
            });
        }
    };
    VElement.prototype.updateListeners = function () {
        // 解除事件
        /*  this.events.forEach(func => {
            func();
        }); */
        var el = this.elm;
        // 事件绑定
        for (var key in (this.on || {})) {
            var eventName = key.replace(/_.*/, ''); // 去除eventUid后缀
            if (!this.events[key] || !this.events[key].fns) {
                // 如果有新事件则进行绑定
                var cut = createFnInvoker(this.on[key], this.context);
                cut.remove = this.addEventListener(el, eventName, cut);
                this.events[key] = cut;
            }
            else {
                // 否则触发函数替换为最新函数
                this.events[key].fns = this.on[key];
            }
        }
        // 卸载无用旧事件
        for (var key in this.events) {
            if (!this.on[key]) {
                this.events[key].remove();
            }
        }
    };
    VElement.prototype.addEventListener = function (el, on, func, capture) {
        if (capture === void 0) { capture = false; }
        el.addEventListener(on, func, capture);
        // 添加事件移除操作
        return function () {
            el.removeEventListener(on, func);
        };
    };
    // 更新节点属性
    VElement.prototype.updateAttrs = function (attrs) {
        this.attrs = attrs;
        this.setAttrs();
    };
    // 设置节点属性
    VElement.prototype.setAttrs = function () {
        var _this = this;
        // 节点属性设置
        if (this.attrs) {
            Object.keys(this.attrs).forEach(function (key) {
                var val = undefined;
                // ref 节点收集
                if (key === 'ref') {
                    _this.context.$refs[_this.attrs[key]] = _this.elm;
                    return;
                }
                if (key === 'value' && _this.tagName === 'input' && _this.attrs['type'] === 'text') {
                    _this.elm.value = _this.attrs[key];
                    return;
                }
                if (key === 'checked' && _this.tagName === 'input' && (_this.attrs['type'] === 'radio' || _this.attrs['type'] === 'checkbox')) {
                    _this.elm.checked = _this.attrs[key];
                    return;
                }
                if (_this.tagName === 'img' && key === 'src' && _this.attrs[key] && typeof _this.attrs[key] === 'object') {
                    val = _this.attrs[key].default;
                }
                else {
                    val = _this.attrs[key];
                }
                if (_this.elm) {
                    _this.elm.setAttribute(key, val);
                }
            });
        }
    };
    return VElement;
}());
exports.VElement = VElement;
/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * */
function createElement(tagName, option, children, $vuip) {
    // 返回虚拟Dom实例
    var options = {
        tagName: tagName,
        option: option,
        children: children,
        context: $vuip
    };
    return new VElement(options);
}
exports.createElement = createElement;
;
