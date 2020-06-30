"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Depend_1 = __importDefault(require("./Depend"));
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
function scheduleWatcherQueue(watcher) {
    if (!watcherQueue.includes(watcher)) {
        watcherQueue.push(watcher);
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
                watcherQueue[i].value = watcherQueue[i].get();
            }
            updating = false;
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
        this.depsMap = {};
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
        if (!this.depsMap[dep.uid]) {
            this.depsMap[dep.uid] = {};
        }
        this.depsMap[dep.uid][key] = dep;
    };
    // 依赖当前哨兵所订阅的数据，如计算属性fullName 依赖farstName 和 lastName
    // 组件mount的哨兵订阅fullName，这样它也需要订阅 farstName 和 lastName
    Watcher.prototype.depend = function () {
        if (Depend_1.default.currentWatcher) {
            for (var depId in this.depsMap) {
                for (var key in this.depsMap[depId]) {
                    this.depsMap[depId][key].addSub(key, Depend_1.default.currentWatcher);
                }
            }
        }
    };
    Watcher.prototype.get = function () {
        pushTarget(this);
        var value = this.getter.call(this.vm, this.vm);
        popTarget();
        return value;
    };
    Watcher.prototype.update = function (key) {
        console.log(key + '收到通知');
        scheduleWatcherQueue(this);
    };
    return Watcher;
}());
Watcher.uid = 0;
exports.default = Watcher;
