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
        this.tagName = tagName; // 标签名
        this.context = context; // dom 所在组件实例
        this.text = undefined; // 文本节点内容
        this.children = undefined; // 子节点
        this.on = on; // dom事件集合
        this.attrs = attrs; // dom属性集合
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
        }
    }
    VElement.prototype.render = function (parentEl) {
        var _this = this;
        var el;
        if (this.tagName === undefined && this.text) {
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
                if (this.child.$parent) {
                    // 将组件添加到付组件实例的$children中
                    this.child.$parent.$children.push(this.child);
                }
            }
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
        // 事件绑定
        if (this.on) {
            Object.keys(this.on).forEach(function (eventName) {
                var cut = createFnInvoker(_this.on[eventName], _this.context);
                el.addEventListener(eventName, cut, false);
            });
        }
        // 处理子元素
        if (Array.isArray(this.children)) {
            this.children.forEach(function (child) {
                if (Array.isArray(child)) {
                    // v-for、slot为数组
                    child.forEach(function (_c) {
                        // 添加子元素到当前元素
                        el.appendChild(_c.render());
                    });
                }
                else {
                    // 添加子元素到当前元素
                    if (_this.attrs['v-html'] && Array.isArray(_this.children)) {
                        // 判断是否采用html渲染，如果是，则child.length === 1
                        if (_this.children && _this.children.length === 1 && child.tagName === undefined) {
                            child.render(el);
                            el.innerHTML = (child.text || ''); //(child.render());
                        }
                        else {
                            throw new Error('v-html 标签下只能包含一个文本标签');
                        }
                    }
                    else {
                        el.appendChild(child.render());
                    }
                }
            });
        }
        return el;
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
                if (_this.tagName === 'input' && key === 'value') {
                    _this.elm.value = _this.attrs[key];
                    return;
                }
                else if (_this.tagName === 'img' && key === 'src' && _this.attrs[key] && typeof _this.attrs[key] === 'object') {
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
