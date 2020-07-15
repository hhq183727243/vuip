import VuiComponent from './VuiComponent.js';
import { VElement } from './VuiElement';
// 任意对象接口
export interface AnyObj {
    [x: string]: any;
}
export interface OnlyFunObj {
    [x: string]: Function;
}

export interface VuipConfig {
    render: (h: (options: Options) => VuiComponent) => VuiComponent,
    id: string,
    router: any,
    store: any
}

// .html 组件导出
export interface Options {
    ast?: AstOptions;
    render?: (parseHTML: (content: string) => AstOptions, $vuip: AnyObj) => AstOptions;
    [x: string]: any;
}

export interface AstOptions {
    type: number;
    tagName?: string;
    attr?: AnyObj;
    content?: string;
    children?: AstOptions[];
}

// 组件实例化参数
export interface ComponentOptions {
    options: Options;
    $parent?: VuiComponent;
    props: {
        [x: string]: any
    };
    $slots?: VElement[];
}

// 组件 config，结合.html组件导出
export interface ComponentConfig extends Lifecycle, Options {
    methods: {
        [x: string]: () => any
    };
    data: () => ({
        [x: string]: any
    });
}

export interface Lifecycle {
    // new Vui 后第一个执行的钩子函数
    willCreate: () => any;
    created: () => any;
    willMount: () => any;
    // 装载结束
    mounted: () => any;
    // 将要更新
    willUpdate: () => any;
    // 更新结束
    updated: () => any;
    // 将要卸载
    willUnmount: () => any;
    // 卸载结束
    unmounted: () => any;
}