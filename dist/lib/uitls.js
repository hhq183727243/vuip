"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 是否是{ }对象
function isObject(val) {
    if (!val) {
        return false;
    }
    return Object.prototype.toString.call(val) === '[object Object]';
}
exports.isObject = isObject;
// 告警
function warn(content) {
    console.warn(content);
}
exports.warn = warn;
// 告警
function isUnd(val) {
    return val === undefined;
}
exports.isUnd = isUnd;
// 是否函数
function isFunc(val) {
    return typeof val === 'function';
}
exports.isFunc = isFunc;
// 是否数组
function isArray(val) {
    return Array.isArray(val);
}
exports.isArray = isArray;
