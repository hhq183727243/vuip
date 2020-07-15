import VuiComponent from './lib/VuiComponent';
import { VuipConfig, Options, ComponentConfig } from './lib/interface';
import proxyObj from './lib/proxy';

function h(options: Options, props = {}): VuiComponent {
    return new VuiComponent({
        options,
        props
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

        if (store) {
            store.state = proxyObj(store.state);
        }

        const $compt: VuiComponent = render(h);
        const $el: HTMLElement = document.querySelector(id) || document.createElement('div');

        if ($compt.$el) {
            $el.innerHTML = '';
            $el.appendChild($compt.$el);
        }

        if (router) {
            router.$app = $compt;
        }
        if (store) {
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

    // 创建组件
    static mountComponent(option: ComponentConfig, props = {}, $parentEl: HTMLElement) {
        const $compt = h(option, props);

        if ($compt.$el && $parentEl) {
            $parentEl.appendChild($compt.$el);
        }

        return $compt;
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