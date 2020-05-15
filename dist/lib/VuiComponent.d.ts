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
    [x: string]: any;
    cid: number;
    componentName: string;
    options: ComponentConfig;
    $el: Element | Text | Comment | null;
    $parent: VuiComponent | undefined;
    $slots: any[] | undefined;
    $children: any[];
    props: AnyObj;
    componentState: string;
    $vNode: VElement | undefined;
    _data: AnyObj;
    _init(): void;
    _proxyData(data: AnyObj): void;
    _reRender(): void;
    _renderVnode(option?: {}): any;
    setData(updateData: AnyObj | undefined, callback: () => {}): void;
    uninstall(): void;
}
