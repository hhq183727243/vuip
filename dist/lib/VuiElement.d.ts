import VuiComponent from "./VuiComponent";
import { ComponentOptions, AnyObj } from './interface';
interface VElementParam {
    tagName: string;
    option: AnyObj | null;
    children: Children;
    context: VuiComponent;
}
declare type _Element = HTMLElement | Text | Comment;
declare global {
    interface Text {
        parentEl: _Element;
    }
    interface Comment {
        parentEl: _Element;
    }
    interface HTMLElement {
        parentEl: _Element;
    }
}
/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * @param context 标签所属组件上下文
 * */
export declare class VElement {
    constructor(options: VElementParam);
    tagName: string;
    context: VuiComponent;
    text?: string | undefined;
    children: Children;
    on: {
        [x: string]: Function;
    };
    attrs: AnyObj;
    child?: VuiComponent | ComponentOptions;
    elm?: _Element;
    render(parentEl?: _Element): _Element;
    renderVList(parentEl: _Element, els: Children): void;
    events: Array<Function>;
    bindEvents(): void;
    updateAttrs(attrs: AnyObj): void;
    setAttrs(): void;
}
declare type Children = VElement[] | VuiComponent | ComponentOptions | string | undefined;
/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * */
export declare function createElement(tagName: string, option: AnyObj | null, children: Children, $vuip: VuiComponent): VElement;
export {};
