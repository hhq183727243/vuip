import VuiComponent from './lib/VuiComponent';
import { VuipConfig, Options, ComponentConfig } from './lib/interface';
declare class Vuip {
    constructor(option: VuipConfig);
    [x: string]: any;
    static componentMap: Map<any, any>;
    static use(plugin: any): void;
    /**
     * 注册全局组件
     * @param name 组件名
     * @param option 组件配置，即.html单文件组件
     * */
    static component(name: string, option: Options): void;
    static mountComponent(option: ComponentConfig, props: {} | undefined, $parentEl: HTMLElement): VuiComponent;
}
declare global {
    interface Window {
        Vuip: Vuip;
    }
}
export default Vuip;
