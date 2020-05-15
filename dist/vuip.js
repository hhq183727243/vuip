"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VuiComponent_1 = __importDefault(require("./lib/VuiComponent"));
function h(options) {
    return new VuiComponent_1.default({
        options: options,
        props: {}
    });
}
var Vuip = /** @class */ (function () {
    function Vuip(option) {
        var render = option.render, id = option.id, router = option.router, store = option.store;
        // 将Vui上的prototype扩展方法注入到VuiComponent实例中
        for (var key in this.__proto__) {
            VuiComponent_1.default.prototype[key] = this.__proto__[key];
        }
        VuiComponent_1.default.prototype.Vuip = Vuip;
        VuiComponent_1.default.prototype.$store = store;
        VuiComponent_1.default.prototype.$router = router;
        var $compt = render(h);
        var $el = document.querySelector(id) || document.createElement('div');
        if ($compt.$el) {
            $el.innerHTML = '';
            $el.appendChild($compt.$el);
        }
        if (router) {
            router.$app = $compt;
        }
        if (router) {
            store.$app = $compt;
        }
        return $compt;
    }
    // 插件使用
    Vuip.use = function (plugin) {
        plugin.install && plugin.install(this);
    };
    /**
     * 注册全局组件
     * @param name 组件名
     * @param option 组件配置，即.html单文件组件
     * */
    Vuip.component = function (name, option) {
        if (name[0].toUpperCase() !== name[0]) {
            throw new Error("<" + name + "> - \u7EC4\u4EF6\u540D\u9996\u4E2A\u5B57\u6BCD\u5FC5\u987B\u5927\u5199");
        }
        if (this.componentMap.get(name)) {
            throw new Error("<" + name + "> - \u7EC4\u4EF6\u540D\u51B2\u7A81\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u4EF6\u540D\u662F\u5426\u5DF2\u6CE8\u518C");
        }
        this.componentMap.set(name, option);
    };
    Vuip.componentMap = new Map();
    return Vuip;
}());
if (window) {
    window.Vuip = Vuip;
}
exports.default = Vuip;
