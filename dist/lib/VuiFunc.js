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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VuiElement_1 = require("./VuiElement");
var VuiComponent_1 = __importDefault(require("./VuiComponent"));
var uitls_1 = require("./uitls");
function createText(content) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}
function createSlots($vuip) {
    return $vuip.$slots;
}
/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
function createComponent(componentName, attr, slotNodes, $vuip, __option__) {
    if (attr === void 0) { attr = {}; }
    // 先从局部组件中获取是否有没，没有则从全局获取
    var componentConfig;
    if ($vuip._options.components && $vuip._options.components[componentName]) {
        componentConfig = $vuip._options.components[componentName];
    }
    else {
        componentConfig = $vuip.Vuip.componentMap.get(componentName);
    }
    if (!componentConfig) {
        throw new Error(componentName + " \u7EC4\u4EF6\u914D\u7F6E\u4E0D\u5B58\u5728");
    }
    // 父组件传参处理
    var props = __assign({}, attr.attrs);
    var events = __assign({}, attr.on);
    var $component;
    // slotNodes.push(createElement.call(this, 'comment', null, 'v-slot'));
    // 如果是更新（即执行_reRender时候）则不创建组件，等待diff后再确认是否创建
    if (__option__.update) {
        $component = {
            $parent: $vuip,
            options: componentConfig,
            props: props,
            $slots: slotNodes
        };
    }
    else {
        $component = new VuiComponent_1.default({
            $parent: $vuip,
            options: componentConfig,
            props: props,
            $slots: slotNodes
        });
        // $vuip.$children.push($component);
    }
    // 设置slot中组件的$parent，如：<Row><Col/></Row>,则col组件的$parent实例应该是row组件实例
    /* if ($component instanceof VuiComponent) {
        slotNodes.forEach(el => {
            if (el.tagName.indexOf('component-') === 0 && ) {
                if (el.child) {
                    el.child.$parent = $component as VuiComponent;
                    ($component as VuiComponent).$children.push(el.child);
                    $vuip
                }
            }
        });
    } */
    // 当前this指with所绑定的顶级作用域
    return VuiElement_1.createElement("component-" + componentConfig.name, { on: events }, $component, $vuip);
}
/**
 * @param data 遍历数据源
 * @param callback 返回v-for标签下面的子节点
 * @param __option__ 其他参数，暂时没用
*/
function getFor(data, callback, $vuip, __option__) {
    var vNodes = [];
    vNodes.push(VuiElement_1.createElement('comment', null, 'v-for', $vuip));
    if (uitls_1.isArray(data)) {
        data.forEach(function (item, i) {
            vNodes.push(callback(item, i));
        });
    }
    else if (uitls_1.isObject(data)) {
        for (var key in data) {
            vNodes.push(callback(data[key], key));
        }
        ;
    }
    else if (uitls_1.isNumber(data)) {
        for (var i = 0; i < data; i++) {
            vNodes.push(callback(i, i));
        }
        ;
    }
    else if (uitls_1.isString(data)) {
        data.split('').forEach(function (item, i) {
            vNodes.push(callback(item, i));
        });
    }
    else {
        uitls_1.warn(data + '为不可遍历数据');
    }
    // vNodes._isVlist = true;
    return vNodes;
}
function getIf(condition, callback, $vuip) {
    return !!(condition) ? callback() : VuiElement_1.createElement('comment', null, condition.toString(), $vuip);
}
function getElseIf(prevConditions, condition, callback, $vuip) {
    // 如果之前任一条件满足，则直接返回注释
    if (prevConditions.includes(true)) {
        return VuiElement_1.createElement('comment', null, 'else-if', $vuip);
    }
    return !!(condition) ? callback() : VuiElement_1.createElement('comment', null, condition.toString(), $vuip);
}
var obj = {
    createText: createText,
    createSlots: createSlots,
    createComponent: createComponent,
    getFor: getFor,
    getIf: getIf,
    getElseIf: getElseIf,
    createElement: VuiElement_1.createElement
};
exports.default = obj;
