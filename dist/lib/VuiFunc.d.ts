import { createElement, VElement } from './VuiElement';
import VuiComponent from './VuiComponent';
import { AnyObj } from './interface';
declare function createText(content: string): string;
declare function createSlots($vuip: VuiComponent): any[] | undefined;
/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
declare function createComponent(componentName: string, attr: AnyObj | undefined, slotNodes: VElement[], $vuip: VuiComponent, __option__: AnyObj): VElement;
/**
 * @param data 遍历数据源
 * @param callback 返回v-for标签下面的子节点
 * @param __option__ 其他参数，暂时没用
*/
declare function getFor(data: [], callback: (item: any, i: number) => VElement, $vuip: VuiComponent, __option__: AnyObj): VElement[];
declare function getIf(condition: boolean, callback: () => VElement, $vuip: VuiComponent): VElement;
declare function getElseIf(prevConditions: boolean[], condition: boolean, callback: () => VElement, $vuip: VuiComponent): VElement;
declare const _default: {
    createText: typeof createText;
    createSlots: typeof createSlots;
    createComponent: typeof createComponent;
    getFor: typeof getFor;
    getIf: typeof getIf;
    getElseIf: typeof getElseIf;
    createElement: typeof createElement;
};
export default _default;
