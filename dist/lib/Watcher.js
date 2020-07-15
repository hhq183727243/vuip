"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Depend_1 = __importDefault(require("./Depend"));
var uitls_1 = require("./uitls");
function getValue(key) {
    return 1;
}
// watcher栈，当嵌套组件时会存在多个render的watcher对象
Depend_1.default.currentWatcher = null;
var targetStack = [];
function pushTarget(target) {
    targetStack.push(target);
    Depend_1.default.currentWatcher = target;
}
function popTarget() {
    targetStack.pop();
    Depend_1.default.currentWatcher = targetStack[targetStack.length - 1];
}
// 哨兵调度,一个宏任务中多次执行this.setData时
// 过滤相同watcher保证同一个watcher只触发一次render
// 按uid排序watcher保证顺序执行，避免后面watcher依赖前watcher导致值更新不及时
var watcherQueue = [];
var updating = false;
var index = null;
function scheduleWatcherQueue(watcher) {
    if (!watcherQueue.includes(watcher)) {
        if (index === null) {
            watcherQueue.push(watcher);
        }
        else {
            // 说明是中途插入，则需要按uid顺序插入指定位置
            var remain = watcherQueue.slice(index + 1);
            var len = remain.length;
            if (len === 0) {
                watcherQueue.push(watcher);
            }
            else {
                for (var i = 0; i < len; i++) {
                    if (watcher.uid < remain[i].uid) {
                        watcherQueue.splice(index + 1 + i, 0, watcher);
                        break;
                    }
                    if (i === len - 1) {
                        watcherQueue.push(watcher);
                    }
                }
            }
        }
    }
    if (!updating) {
        updating = true;
        Promise.resolve().then(function () {
            watcherQueue.sort(function (a, b) {
                return a.uid - b.uid;
            });
            // 不能用forEach，且不能缓存length，因为在执行一个更新watcher时候可能会触发另一个watcher更新
            // 新的watcher也需要更新
            for (var i = 0; i < watcherQueue.length; i++) {
                index = i;
                watcherQueue[i].value = watcherQueue[i].get();
            }
            updating = false;
            index = null;
            watcherQueue.length = 0;
        });
    }
}
var Watcher = /** @class */ (function () {
    function Watcher(vm, expOrFn, renderWatcher) {
        if (renderWatcher === void 0) { renderWatcher = false; }
        this.uid = Watcher.uid++;
        this.vm = vm;
        this.updating = false; // 是否在更新中
        this.depsMap = new Map();
        this.newDepsMap = new Map();
        if (renderWatcher) {
            vm.watcher = this;
        }
        // 判断key是表达式还是方法
        if (typeof expOrFn === 'string') {
            this.getter = getValue;
        }
        else {
            this.getter = expOrFn;
        }
        this.value = this.get();
        // 组件收集watcher实例，用于在组件卸载时,需要冲依赖中删除这些哨兵，避免冗余get取值
        vm.watchers.push(this);
    }
    // 添加依赖，格式 { depId: { 订阅字段: dep } }
    Watcher.prototype.addDep = function (key, dep) {
        if (uitls_1.isUnd(this.newDepsMap.get(dep.uid))) {
            this.newDepsMap.set(dep.uid, {});
        }
        var depMap = this.newDepsMap.get(dep.uid);
        depMap[key] = dep;
    };
    // 依赖当前哨兵所订阅的数据，如计算属性fullName 依赖farstName 和 lastName
    // 组件mount的哨兵订阅fullName，这样它也需要订阅 farstName 和 lastName
    Watcher.prototype.depend = function () {
        if (Depend_1.default.currentWatcher) {
            this.depsMap.forEach(function (value) {
                for (var key in value) {
                    value[key].addSub(key, Depend_1.default.currentWatcher);
                }
            });
        }
    };
    Watcher.prototype.get = function () {
        pushTarget(this);
        var value;
        try {
            // 异常捕获，当一个watcher取值异常时不会导致项目停止
            value = this.getter.call(this.vm, this.vm);
        }
        catch (error) {
            uitls_1.warn(error);
        }
        popTarget();
        this.clearDep();
        return value;
    };
    // 每次get数据完后都清除一次无效依赖
    // 比如在计算属性中打断点时，此时在控制台访问例：this.foo属性时，这时会照成改计算属性的watcher也会去监听foo属性
    // 但实际这个属性是不依赖foo属性的，因此会照成此后每次foo更新时都会重新计算，浪费资源
    // 因此每次watcher.get完后都做下无效依赖清除
    Watcher.prototype.clearDep = function () {
        var _this = this;
        // keyDep: {name: Dep, age: Dep}
        // depUid: uid
        this.depsMap.forEach(function (keyDep, depUid) {
            if (!uitls_1.isUnd(_this.newDepsMap.get(depUid))) {
                var newkDeps = _this.newDepsMap.get(depUid);
                for (var key in keyDep) {
                    // 如果newkDeps中不存在对应的Dep，则说明是多余的
                    if (uitls_1.isUnd(newkDeps[key])) {
                        keyDep[key].removeSub(key, _this);
                    }
                }
            }
            else {
                for (var key in keyDep) {
                    keyDep[key].removeSub(key, _this);
                }
            }
        });
        this.depsMap = this.newDepsMap;
        this.newDepsMap = new Map();
    };
    Watcher.prototype.update = function (key) {
        console.log(key + '收到通知');
        scheduleWatcherQueue(this);
    };
    return Watcher;
}());
Watcher.uid = 0;
exports.default = Watcher;
