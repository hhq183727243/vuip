import VuiComponent from './lib/VuiComponent';
import { VuipConfig, Options } from './lib/interface';

function h(options: Options): VuiComponent {
    return new VuiComponent({
        options,
        props: {}
    });
}

class Vuip {
    constructor(option: VuipConfig) {
        const { render, id, router, store } = option;

        // 将Vui上的prototype扩展方法注入到VuiComponent实例中
        for (let key in this.__proto__) {
            VuiComponent.prototype[key] = this.__proto__[key]
        }
        VuiComponent.prototype.Vuip = Vuip;
        VuiComponent.prototype.$store = store;
        VuiComponent.prototype.$router = router;
        const $compt: VuiComponent = render(h);
        const $el: HTMLElement = document.querySelector(id) || document.createElement('div');

        if ($compt.$vNode) {
            $compt.$el = $compt.$vNode.render();
            $el.innerHTML = '';
            $el.appendChild($compt.$el);
        }

        if (router) {
            router.$app = $compt;
        }
        if (router) {
            store.$app = $compt;
        }

        return $compt;
    }
    [x: string]: any

    static componentMap = new Map();

    // 插件使用
    static use(plugin: any) {
        plugin.install && plugin.install(this);
    }
    /**
     * 注册全局组件
     * @param name 组件名
     * @param option 组件配置，即.html单文件组件
     * */
    static component(name: string, option: Options) {
        if (name[0].toUpperCase() !== name[0]) {
            throw new Error(`<${name}> - 组件名首个字母必须大写`);
        }
        if (this.componentMap.get(name)) {
            throw new Error(`<${name}> - 组件名冲突，请检查组件名是否已注册`);
        }
        this.componentMap.set(name, option);
    }
}

declare global {
    interface Window {
        Vuip: Vuip
    }
}

if (window) {
    window.Vuip = Vuip;
}

export default Vuip; 