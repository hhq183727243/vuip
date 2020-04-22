import VuiComponent from './VuiComponent.js';
import { VElement } from './VuiElement';
export interface AnyObj {
    [x: string]: any;
}
export interface OnlyFunObj {
    [x: string]: () => any;
}
export interface VuipConfig {
    render: (h: (options: Options) => VuiComponent) => VuiComponent;
    id: string;
    router: any;
    store: any;
}
export interface Options {
    ast?: AstOptions;
    render?: (parseHTML: (content: string) => AstOptions, $vuip: VuiComponent) => AstOptions;
    [x: string]: any;
}
export interface AstOptions {
    type: number;
    tagName?: string;
    attr?: AnyObj;
    content?: string;
    children?: AstOptions[];
}
export interface ComponentOptions {
    options: Options;
    $parent?: VuiComponent;
    props: {
        [x: string]: any;
    };
    $slots?: VElement[];
}
export interface ComponentConfig extends Lifecycle, Options {
    methods: {
        [x: string]: () => any;
    };
    data: () => ({
        [x: string]: any;
    });
}
export interface Lifecycle {
    willCreate: () => any;
    created: () => any;
    willMount: () => any;
    mounted: () => any;
    willUpdate: () => any;
    updated: () => any;
    willUnmount: () => any;
    unmounted: () => any;
}
