"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const watcherQueue = []; // watcher队列
var Depend = /** @class */ (function () {
    function Depend() {
        this.uid = Depend.uid++;
        this.subs = {}; // watcher实例集合
        this.subsId = {}; // watcherId集合
    }
    Depend.prototype.addSub = function (key, w) {
        if (this.subsId[key] === undefined) {
            this.subsId[key] = [];
        }
        if (!this.subsId[key].includes(w.uid)) {
            if (this.subs[key] === undefined) {
                this.subs[key] = [];
            }
            // 添加订阅者
            this.subs[key].push(w);
            this.subsId[key].push(w.uid);
        }
        w.addDep(key, this);
    };
    Depend.prototype.notice = function (key) {
        (this.subs[key] || []).forEach(function (watcher) {
            watcher.update(key);
        });
    };
    // 移除订阅者
    Depend.prototype.removeSub = function (key, w) {
        if (this.subsId[key].includes(w.uid)) {
            var index = this.subsId[key].indexOf(w.uid);
            this.subsId[key].splice(index, 1);
            // 删除订阅者
            index = this.subs[key].indexOf(w);
            this.subs[key].splice(index, 1);
        }
    };
    return Depend;
}());
Depend.uid = 0;
exports.default = Depend;
