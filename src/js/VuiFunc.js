import { createElement } from './VuiElement';
import VuiComponent from './VuiComponent';

function createText(content) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}

function createSlots() {
    return this.$vuip.$slots;
}

/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
function createComponent(componentName, attr = {}, slotNodes, __option__) {
    // 先从局部组件中获取是否有没，没有则从全局获取
    let componentConfig = null;

    if (this.$vuip.config.component && this.$vuip.config.component[componentName]) {
        componentConfig = this.$vuip.config.component[componentName];
    } else {
        componentConfig = this.$vuip.Vuip.componentMap.get(componentName);
    }

    if (!componentConfig) {
        throw new Error(`VUI 组件配置不存在`);
    }

    // 父组件传参处理
    const props = { ...attr };

    let $component = null;
    // slotNodes.push(createElement.call(this, 'comment', null, 'v-slot'));
    // 如果是更新（即执行_reRender时候）则不创建组件，等待diff后再确认是否创建
    if (__option__.update) {
        $component = {
            $parent: this.$vuip,
            config: componentConfig,
            props,
            $slots: slotNodes
        };
    } else {
        $component = new VuiComponent({
            $parent: this.$vuip,
            config: componentConfig,
            props,
            $slots: slotNodes
        });

        this.$vuip.$children.push($component);
    }

    // 当前this指with所绑定的顶级作用域
    return createElement.call(this, `component-${$component.config.name}`, null, $component);
}

/**
 * @param data 遍历数据源
 * @param callback 返回v-for标签下面的子节点
 * @param __option__ 其他参数，暂时没用
*/
function getFor(data, callback, __option__) {
    const vNodes = [];
    vNodes.push(createElement.call(this, 'comment', null, 'v-for'));

    (data || []).forEach((item, i) => {
        vNodes.push(callback(item, i));
    });

    vNodes._isVlist = true;

    return vNodes;
}

function getIf(condition, callback) {
    return !!(condition) ? callback() : createElement.call(this, 'comment', null, condition);
}
function getElseIf(prevConditions, condition, callback) {
    // 如果之前任一条件满足，则直接返回注释
    if (prevConditions.includes(true)) {
        return createElement.call(this, 'comment', null, 'else-if');
    }
    return !!(condition) ? callback() : createElement.call(this, 'comment', null, condition);
}

export default {
    createText,
    createSlots,
    createComponent,
    getFor,
    getIf,
    getElseIf,
    createElement
}