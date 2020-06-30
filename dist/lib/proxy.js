"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Depend_1 = __importDefault(require("./Depend"));
var Watcher_1 = __importDefault(require("./Watcher"));
var VuiComponent_1 = __importDefault(require("./VuiComponent"));
var uitls_1 = require("./uitls");
// 代理对象
function proxyObj(obj) {
    if (!uitls_1.isObject(obj) || obj.__isProxy__) {
        return obj;
    }
    var dep = new Depend_1.default();
    var _proxy = new Proxy(obj, {
        get: function (target, key, proxy) {
            if (key === '__isProxy__') {
                return true;
            }
            if (typeof key !== 'symbol'
                && Depend_1.default.currentWatcher
                && !uitls_1.isFunc(target[key]) // 不为函数收集依赖
                && !(target[key] instanceof VuiComponent_1.default) // 不为vm实例收集依赖
            ) {
                dep.addSub(key, Depend_1.default.currentWatcher);
            }
            // 计算属性
            if (target[key] instanceof Watcher_1.default) {
                // 从哨兵中取值时，那么当面currentWatcher也依赖于这个哨兵所观察的所有对象
                if (Depend_1.default.currentWatcher) {
                    target[key].depend();
                }
                return target[key].value;
            }
            return target[key];
        },
        set: function (target, key, value, receiver) {
            // throw new Error(`VUI 不允许直接对data赋值，否则可能会引起一些未知异常`);
            if (typeof value === 'object' && !(value instanceof Watcher_1.default)) {
                target[key] = proxyObj(value);
            }
            else {
                target[key] = value;
            }
            dep.notice(key);
            return true;
        }
    });
    for (var key in obj) {
        if (!(obj[key] instanceof VuiComponent_1.default) &&
            !(obj[key] instanceof Watcher_1.default)) {
            obj[key] = proxyObj(obj[key]);
        }
    }
    return _proxy;
}
exports.default = proxyObj;
