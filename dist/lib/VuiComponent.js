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
var VuiFunc_1 = __importDefault(require("./VuiFunc"));
var parseHTML_1 = __importDefault(require("./parseHTML"));
var VuiCreateCode_1 = __importDefault(require("./VuiCreateCode"));
var UNCREATED = 'UNCREATED';
var CREATED = 'CREATED';
var componentCache = {};
var cid = 0;
function createFunction(code) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}
var lifecycleFun = function (name) {
    return function () {
        console.log(name);
    };
};
var lifecycleDefault = {
    willCreate: lifecycleFun('willCreate'),
    created: lifecycleFun('created'),
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
        this.config = Object.assign({
            methods: {},
            data: function () { return {}; },
        }, lifecycleDefault, options);
        this.config.willCreate.bind(this)();
        this.componentName = this.config.name;
        this.$el = null;
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.props = props;
        this.componentState = UNCREATED; // 组件状态
        this._data = this.config.data() || {};
        for (var funName in this.config.methods) {
            this[funName] = this.config.methods[funName];
        }
        this._init();
    }
    VuiComponent.prototype._init = function () {
        var _this = this;
        this._proxyData(this._data);
        var code = '';
        if (this.config.ast) {
            code = VuiCreateCode_1.default(this.config.ast, null);
        }
        else if (typeof this.config.render === 'function') {
            code = VuiCreateCode_1.default(this.config.render(parseHTML_1.default, this), null);
        }
        else {
            throw new Error('缺少html视图模板，无法实例化组件');
        }
        this.$render = createFunction(code);
        this.$vNode = this._renderVnode();
        // 将组件dom缓存起来
        componentCache[this.cid] = this;
        // 自定义组件
        new Promise(function (resolve, reject) {
            resolve();
        }).then(function () {
            if (typeof _this.config.mounted === 'function' && _this.componentState === UNCREATED) {
                _this.componentState = CREATED;
                _this.config.mounted.call(_this);
            }
        });
    };
    VuiComponent.prototype._proxyData = function (data) {
        var _this = this;
        this.data = new Proxy(data, {
            get: function (target, key, proxy) {
                if (typeof (target[key]) === 'function') {
                    return target[key].bind(_this)();
                }
                return target[key];
            },
            set: function (target, key, value, proxy) {
                throw new Error("VUI \u4E0D\u5141\u8BB8\u76F4\u63A5\u5BF9data\u8D4B\u503C\uFF0C\u5426\u5219\u53EF\u80FD\u4F1A\u5F15\u8D77\u4E00\u4E9B\u672A\u77E5\u5F02\u5E38");
            }
        });
    };
    VuiComponent.prototype._reRender = function () {
        // 当组件参数由render函数返回时，需每次都需要重新执行render函数
        if (typeof (this.config.render) === 'function') {
            var code = VuiCreateCode_1.default(this.config.render(parseHTML_1.default, this), null);
            this.$render = createFunction(code);
        }
        var $newVNode = this._renderVnode({
            update: true
        });
        if (this.$vNode) {
            var patches = VuiDiff_1.default(this.$vNode, $newVNode);
            if (patches.length) {
                // console.log(patches);
                VuiDiff_1.updateDom(patches);
                if (typeof this.config.updated === 'function') {
                    this.config.updated.call(this);
                }
            }
        }
    };
    VuiComponent.prototype._renderVnode = function (option) {
        var _this = this;
        if (option === void 0) { option = {}; }
        var methods = {};
        Object.keys(this.config.methods).forEach(function (functionName) {
            // 绑定methods作用域
            methods[functionName] = _this.config.methods[functionName].bind(_this);
        });
        // 如果data中属性值是function则说明该属性为计算属性
        return this.$render.call(__assign(__assign(__assign({}, VuiFunc_1.default), { props: this.props, state: this.$store ? this.$store.state : {}, $vuip: this, data: this.data }), methods), __assign({ update: false }, option));
    };
    // 更新数据
    VuiComponent.prototype.setData = function (updateData, callback) {
        var _this = this;
        if (updateData === void 0) { updateData = {}; }
        this.renderEnd = false;
        for (var key in updateData) {
            this._data[key] = updateData[key];
        }
        // renderEnd 防止在一个事件循环中多次调用setData导致重复渲染
        new Promise(function (resolve) {
            resolve();
        }).then(function () {
            if (!_this.renderEnd) {
                _this._reRender();
                _this.renderEnd = true;
                callback && callback();
            }
        });
    };
    // 组件卸载
    VuiComponent.prototype.uninstall = function () {
        var _this = this;
        if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
        this.config.willUnmount.call(this);
        this.config.unmounted.call(this);
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
        // 子组件卸载
        this.$children.forEach(function (comp) {
            comp.uninstall();
        });
    };
    return VuiComponent;
}());
exports.default = VuiComponent;
