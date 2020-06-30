import { createElement, VElement } from './VuiElement';
import VuiComponent from './VuiComponent';
import { ComponentOptions, ComponentConfig, AnyObj, OnlyFunObj } from './interface';

function createText(content: string) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}

function createSlots($vuip: VuiComponent) {
    return $vuip.$slots;
}

/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
function createComponent(componentName: string, attr: AnyObj = {}, slotNodes: VElement[], $vuip: VuiComponent, __option__: AnyObj) {
    // 先从局部组件中获取是否有没，没有则从全局获取
    let componentConfig: ComponentConfig;

    if ($vuip.options.components && $vuip.options.components[componentName]) {
        componentConfig = $vuip.options.components[componentName];
    } else {
        componentConfig = $vuip.Vuip.componentMap.get(componentName);
    }

    if (!componentConfig) {
        throw new Error(`${componentName} 组件配置不存在`);
    }

    // 父组件传参处理
    const props = { ...attr };

    let $component: VuiComponent | ComponentOptions;
    // slotNodes.push(createElement.call(this, 'comment', null, 'v-slot'));
    // 如果是更新（即执行_reRender时候）则不创建组件，等待diff后再确认是否创建
    if (__option__.update) {
        $component = {
            $parent: $vuip,
            options: componentConfig,
            props,
            $slots: slotNodes
        };
    } else {
        $component = new VuiComponent({
            $parent: $vuip,
            options: componentConfig,
            props,
            $slots: slotNodes
        });

        $vuip.$children.push($component);
    }

    // 当前this指with所绑定的顶级作用域
    return createElement(`component-${componentConfig.name}`, {}, $component, $vuip);
}

/**
 * @param data 遍历数据源
 * @param callback 返回v-for标签下面的子节点
 * @param __option__ 其他参数，暂时没用
*/
function getFor(data: [], callback: (item: any, i: number) => VElement, $vuip: VuiComponent, __option__: AnyObj) {
    const vNodes: VElement[] = [];
    vNodes.push(createElement('comment', null, 'v-for', $vuip));

    (data || []).forEach((item, i) => {
        vNodes.push(callback(item, i));
    });

    // vNodes._isVlist = true;

    return vNodes;
}

function getIf(condition: boolean, callback: () => VElement, $vuip: VuiComponent) {
    return !!(condition) ? callback() : createElement('comment', null, condition.toString(), $vuip);
}

function getElseIf(prevConditions: boolean[], condition: boolean, callback: () => VElement, $vuip: VuiComponent) {
    // 如果之前任一条件满足，则直接返回注释
    if (prevConditions.includes(true)) {
        return createElement('comment', null, 'else-if', $vuip);
    }
    return !!(condition) ? callback() : createElement('comment', null, condition.toString(), $vuip);
}


const obj: OnlyFunObj = {
    createText,
    createSlots,
    createComponent,
    getFor,
    getIf,
    getElseIf,
    createElement
}
export default obj;