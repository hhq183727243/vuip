import VuiComponent from './VuiComponent.js';

function h(config) {
    return new VuiComponent({ config });
}

class Vuip {
    constructor(option) {
        const { render, id, router } = option;

        // 将Vui上的prototype扩展方法注入到VuiComponent实例中
        for (let key in this.__proto__) {
            VuiComponent.prototype[key] = this.__proto__[key]
        }
        VuiComponent.prototype.Vuip = Vuip;

        const $compt = render(h);
        const $app = document.querySelector(id);
        $compt.$el = $compt.$vNode.render();
        if (router) {
            $compt.$router = router;
            router.$app = $compt;
        }
        $app.innerHTML = '';
        $app.appendChild($compt.$el);

        return $compt;
    }

    // 插件使用
    static use(plugin) {
        plugin.install && plugin.install(this);
    }

    /**
     * 注册全局组件
     * @param name 组件名
     * @param option 组件配置，即.html单文件组件
     * */
    static component(name, option) {
        if (this.componentMap.get(name)) {
            throw new Error(`<${name}> - 组件名冲突，请检查组件名是否已注册`);
        }
        this.componentMap.set(name, option);
    }
}

Vuip.componentMap = new Map();

export default Vuip; 