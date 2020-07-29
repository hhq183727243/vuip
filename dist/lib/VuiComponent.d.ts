import Watcher from './Watcher';
import { VElement } from './VuiElement';
import { ComponentOptions, ComponentConfig, AnyObj } from './interface';
/**
 * @param $parent 父组件实例
 * @param config 组件配置
 * @param props 来自父组件参数
 * @param $slots 组件插槽
*/
export default class VuiComponent {
    constructor(config: ComponentOptions);
    $computed: AnyObj;
    $proxyRender: AnyObj;
    $proxyInstance: AnyObj;
    [x: string]: any;
    cid: number;
    watcher: Watcher | null;
    watchers: Array<Watcher>;
    componentName: string;
    _options: ComponentConfig;
    $parentVNode: VElement | undefined;
    $el: Element | Text | Comment | null;
    $refs: AnyObj;
    $parent: VuiComponent | undefined;
    $slots: any[] | undefined;
    $children: any[];
    $props: AnyObj;
    _componentState: string;
    $vNode: VElement | undefined;
    _updateDate: AnyObj;
    _initProxyInstance(): void;
    _initStore(): void;
    _initProps(): void;
    _initData(): void;
    _initMethods(): void;
    _initProxyRender(): void;
    _mount(): void;
    _renderVnode(option?: {}): VElement;
    _mountComponent(): void;
    _update(vnode: VElement): void;
    _updating: boolean;
    _updatedCallback: Array<Function>;
    setData(data: AnyObj | undefined, callback: () => {}): void;
    uninstall(): void;
}
