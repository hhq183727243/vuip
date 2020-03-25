import { createElement } from './VuiElement';
import VuiComponent from './VuiComponent';

function createText(content) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}

function createSlots() {
    return this.$vui.$slots;
}

/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
function createComponent(componentName, attr = {}, slotNodes, __option__) {
    // console.log(__option__);
    let componentConfig = this.$vui.config.component[componentName];

    // 父组件传参处理
    const props = { ...attr };

    let $component = null;

    // 如果是更新（即执行_reRender时候）则不创建组件，等待diff后再确认是否创建
    if (__option__.update) {
        $component = {
            $parent: this.$vui,
            config: componentConfig,
            props,
            $slots: slotNodes
        };
    } else {
        $component = new VuiComponent({
            $parent: this.$vui,
            config: componentConfig,
            props,
            $slots: slotNodes
        });

        this.$vui.$children.push($component);
    }

    // 当前this指with所绑定的顶级作用域
    return createElement.call(this, `component-${$component.config.name}`, null, $component);
}

function getFor(data, callback, __option__) {
    const vNodes = [];
    vNodes.push(createElement.call(this, 'comment', null, 'v-for'));

    (data || []).forEach((item, i) => {
        vNodes.push(callback(item, i));
    });

    vNodes._isVlist = true;
    // vNodes._index = __option__;

    return vNodes;
}

function getIf(condition, callback) {
    return !!(condition) ? callback() : createElement.call(this, 'comment', null, condition);
}

export default {
    createText,
    createSlots,
    createComponent,
    getFor,
    getIf,
    createElement
}