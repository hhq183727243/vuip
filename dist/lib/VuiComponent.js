"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VuiDiff_1 = __importStar(require("./VuiDiff"));
var Watcher_1 = __importDefault(require("./Watcher"));
var VuiFunc_1 = __importDefault(require("./VuiFunc"));
var parseHTML_1 = __importDefault(require("./parseHTML"));
var VuiCreateCode_1 = __importDefault(require("./VuiCreateCode"));
var uitls_1 = require("./uitls");
var proxy_1 = __importDefault(require("./proxy"));
var UNCREATED = 'uncreate'; // 未装载
var CREATED = 'created'; // 已装载
var UNINSTALL = 'uninstall'; // 已卸载
// const componentCache: {
//     [x: string]: VuiComponent
// } = {};
var cid = 0;
function createFunction(code) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}
var lifecycleFun = function (name) {
    return function () {
        // console.log(name)
    };
};
var lifecycleDefault = {
    // new Vuip 一个钩子
    willCreate: lifecycleFun('willCreate'),
    // new Vuip 实例属性设置完成
    created: lifecycleFun('created'),
    // 
    willMount: lifecycleFun('willMount'),
    // 装载结束
    mounted: lifecycleFun('mounted'),
    // 将要更新
    willUpdate: lifecycleFun('willUpdate'),
    // 更新结束
    updated: lifecycleFun('updated'),
    // 将要卸载
    willUnmount: lifecycleFun('willUnmount'),
    // 卸载结束
    unmounted: lifecycleFun('unmounted')
};
/**
 * @param $parent 父组件实例
 * @param config 组件配置
 * @param props 来自父组件参数
 * @param $slots 组件插槽
*/
var VuiComponent = /** @class */ (function () {
    function VuiComponent(config) {
        var $parent = config.$parent, options = config.options, _a = config.props, props = _a === void 0 ? {} : _a, $slots = config.$slots;
        this.cid = cid++;
        this._options = Object.assign({
            methods: {},
            data: function () { return {}; },
        }, lifecycleDefault, options);
        this.componentName = this._options.name;
        this.watcher = null;
        this.watchers = [];
        this.$el = null;
        this.$refs = {};
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.$props = props;
        this._componentState = UNCREATED; // 组件状态
        this._updateDate = {}; // 更新数据集合 
        this._updating = false; // this.setData 是否在更新中
        this._updatedCallback = []; // this.setData回调集合
        this.$computed = {};
        this.$proxyRender = {
            $vuip: this
        }; // 代理render作用域
        this.$proxyInstance = {}; // 代理实例
        if (this.$parent) {
            this.$parent.$children.push(this);
        }
        this._options.willCreate.call(this);
        this._initProxyInstance();
        this._initStore();
        this._initProps();
        this._initData();
        this._initMethods();
        this._initProxyRender();
        this._options.created.call(this.$proxyInstance);
        this._mount();
    }
    // _data: AnyObj;
    VuiComponent.prototype._initProxyInstance = function () {
        // 代理实例
        this.$proxyInstance = new Proxy(this, {
            get: function (target, key, proxy) {
                if (!uitls_1.isUnd(target[key])) {
                    return target[key];
                }
                if (!uitls_1.isUnd(target.$proxyRender[key])) {
                    return target.$proxyRender[key];
                }
                return target[key];
            },
            set: function (target, key, value, receiver) {
                // throw new Error(`VUIP 不允许直接对实例赋值`);
                target[key] = value;
                return true;
            }
        });
    };
    // 全局状态
    VuiComponent.prototype._initStore = function () {
        if (this.$store) {
            this.$proxyRender[this.$store.aliasName] = this.$store.state;
        }
    };
    VuiComponent.prototype._initProps = function () {
        this.$proxyRender.props = {};
        for (var key in this.$props) {
            this.$proxyRender.props[key] = this.$props[key];
        }
    };
    VuiComponent.prototype._initData = function () {
        var data = {};
        if (typeof this._options.data === 'function') {
            data = this._options.data.call(this.$proxyInstance);
            if (!uitls_1.isObject(data)) {
                uitls_1.warn('data 必须放回一个{}格式对象');
                data = {};
            }
        }
        else {
            uitls_1.warn('data 必须是一个函数，且返回一个{}对象');
            data = {};
        }
        for (var key in data) {
            if (uitls_1.isUnd(this.$proxyRender[key]) && uitls_1.isUnd(this[key])) {
                if (uitls_1.isFunc(data[key])) {
                    this.$computed[key] = data[key];
                }
                else {
                    this.$proxyRender[key] = data[key];
                }
            }
            else {
                uitls_1.warn("data \u5C5E\u6027\u3010" + key + "\u3011\u4E0E\u5B9E\u4F8B\u5C5E\u6027\u547D\u540D\u51B2\u7A81");
            }
        }
    };
    VuiComponent.prototype._initMethods = function () {
        for (var funName in VuiFunc_1.default) {
            this.$proxyRender[funName] = VuiFunc_1.default[funName];
        }
        for (var funName in this._options.methods) {
            if (uitls_1.isUnd(this.$proxyRender[funName]) && uitls_1.isUnd(this[funName])) {
                this.$proxyRender[funName] = this._options.methods[funName].bind(this.$proxyInstance);
            }
            else {
                uitls_1.warn("methods \u65B9\u6CD5\u540D\u3010" + funName + "\u3011\u4E0E\u5B9E\u4F8B\u5C5E\u6027\u547D\u540D\u51B2\u7A81\uFF0C\u6216\u5728data\u4E2D\u5B9A\u4E49\u8FC7");
            }
        }
    };
    VuiComponent.prototype._initProxyRender = function () {
        var _this = this;
        // 代理render作用域
        this.$proxyRender = proxy_1.default(this.$proxyRender);
        var _loop_1 = function (key) {
            this_1.$proxyRender[key] = new Watcher_1.default(this_1, function () {
                return _this.$computed[key].call(_this.$proxyInstance);
            });
        };
        var this_1 = this;
        for (var key in this.$computed) {
            _loop_1(key);
        }
    };
    VuiComponent.prototype._mount = function () {
        // 构建codeStr
        var code = '';
        if (this._options.ast) {
            code = VuiCreateCode_1.default(this._options.ast, null, []);
        }
        else if (typeof this._options.render === 'function') {
            // 如果是自定义render函数，则初始化时不构建，放在watcher.get时创建
            code = '';
        }
        else {
            code = VuiCreateCode_1.default({ type: 1, tagName: 'comment' }, null, []);
            uitls_1.warn('缺少html视图模板');
        }
        // 生成render函数
        this.$render = createFunction(code);
        // 装载组件
        this._mountComponent();
    };
    VuiComponent.prototype._renderVnode = function (option) {
        // 如果data中属性值是function则说明该属性为计算属性
        // this.$proxyRender.state = this.$store ? this.$store.state : {};
        if (option === void 0) { option = {}; }
        // 当组件参数由render函数返回时，需每次都需要重新执行render函数
        if (typeof (this._options.render) === 'function') {
            var code = VuiCreateCode_1.default(this._options.render(parseHTML_1.default, this.$proxyInstance), null, []);
            this.$render = createFunction(code);
        }
        return this.$render.call(this.$proxyRender, __assign({ update: this._componentState === CREATED }, option));
    };
    // 装载组件
    VuiComponent.prototype._mountComponent = function () {
        var _this = this;
        this._options.willMount.call(this.$proxyInstance);
        var mount = function () {
            _this._update(_this._renderVnode());
        };
        // 为mount添加观察者
        new Watcher_1.default(this, mount, true);
        // 将组件dom缓存起来
        // componentCache[this.cid] = this;
        // 挂载完毕
        this._componentState = CREATED;
        this._options.mounted.call(this.$proxyInstance);
    };
    VuiComponent.prototype._update = function (vnode) {
        if (this._componentState === UNCREATED) {
            // 首次render
            this.$vNode = vnode;
            // 创建虚拟Dom
            this.$el = this.$vNode.render();
        }
        else {
            // 组件更新
            this._options.willUpdate.call(this.$proxyInstance);
            var $newVNode = vnode;
            if (this.$vNode) {
                var patches = VuiDiff_1.default(this.$vNode, $newVNode);
                if (patches.length) {
                    // console.log(patches);
                    VuiDiff_1.updateDom(patches);
                    if (typeof this._options.updated === 'function') {
                        this._options.updated.call(this.$proxyInstance);
                    }
                }
            }
        }
    };
    // 更新数据
    VuiComponent.prototype.setData = function (data, callback) {
        var _this = this;
        if (data === void 0) { data = {}; }
        this._updating = false;
        if (!uitls_1.isObject(data)) {
            uitls_1.warn('setData必须接收一个{}对象参数');
            return;
        }
        for (var key in data) {
            this._updateDate[key] = data[key]; // 要更新的数据
        }
        if (uitls_1.isFunc(callback)) {
            this._updatedCallback.push(callback);
        }
        // _updating 防止在一个事件循环中多次调用setData导致重复渲染
        if (!this._updating) {
            this._updating = true;
            new Promise(function (resolve) {
                resolve();
            }).then(function () {
                // this._reRender();
                for (var key in _this._updateDate) {
                    // this.data[key] = data[key]; // 同步到this.data
                    _this.$proxyRender[key] = _this._updateDate[key];
                }
                _this._updateDate = {};
                _this._updating = false;
                var callbacks = _this._updatedCallback;
                setTimeout(function () {
                    callbacks.forEach(function (func) {
                        try {
                            func();
                        }
                        catch (error) {
                            uitls_1.warn(error);
                        }
                    });
                }, 0);
                _this._updatedCallback = [];
            });
        }
    };
    // 组件卸载
    VuiComponent.prototype.uninstall = function () {
        var _this = this;
        this._options.willUnmount.call(this.$proxyInstance);
        // 节点移除
        if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
        // 从$parent的$children中删除已卸载组件
        var index = null;
        if (this.$parent) {
            this.$parent.$children.forEach(function (item, i) {
                if (item === _this) {
                    index = i;
                }
            });
            if (index !== null) {
                this.$parent.$children.splice(index, 1);
            }
        }
        var $children = this.$children;
        // 如果父组件卸载，则所有子组件都会被卸载，因此为this.$children = []
        this.$children = [];
        // 子组件卸载
        $children.forEach(function (comp) {
            comp.uninstall();
        });
        this._componentState = UNINSTALL;
        this._options.unmounted.call(this.$proxyInstance);
    };
    return VuiComponent;
}());
exports.default = VuiComponent;
