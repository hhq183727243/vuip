import diff, { updateDom } from './VuiDiff';
import VuiFunc from './VuiFunc';
import parseHTML from './parseHTML';
import createCode from './VuiCreateCode';
import { VElement } from './VuiElement';
import { ComponentOptions, ComponentConfig, Lifecycle, AnyObj, OnlyFunObj } from './interface';

const UNCREATED: string = 'UNCREATED';
const CREATED: string = 'CREATED';
const componentCache: {
    [x: string]: VuiComponent
} = {};

let cid = 0;

function createFunction(code: string) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}

const lifecycleFun = (name: string) => {
    return () => {
        console.log(name)
    }
};

const lifecycleDefault: Lifecycle = {
    willCreate: lifecycleFun('willCreate'),
    created: lifecycleFun('created'),
    willMount: lifecycleFun('willMount'),
    // 装载结束
    mounted: lifecycleFun('mounted'),
    // 将要更新
    willUpdate: lifecycleFun('willUpdate'),
    // 更新结束
    updated: lifecycleFun('updated'),
    // 将要卸载
    willUnmount: lifecycleFun('willUnmount'),
    // 卸载结束
    unmounted: lifecycleFun('unmounted')
}

/**
 * @param $parent 父组件实例
 * @param config 组件配置
 * @param props 来自父组件参数
 * @param $slots 组件插槽
*/
export default class VuiComponent {
    constructor(config: ComponentOptions) {
        const { $parent, options, props = {}, $slots } = config;

        this.cid = cid++;
        this.config = Object.assign({
            methods: {},
            data() { return {} },
        }, lifecycleDefault, options);

        this.config.willCreate.bind(this)();
        this.componentName = this.config.name;
        this.$el = null;
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.props = props;
        this.componentState = UNCREATED; // 组件状态
        this._data = this.config.data() || {};

        for (let funName in this.config.methods) {
            this[funName] = this.config.methods[funName];
        }

        this._init();
    }
    [x: string]: any; // 动态添加属性
    cid: number;
    componentName: string;
    config: ComponentConfig;
    $el: Element | Text | Comment | null;
    $parent: VuiComponent | undefined;
    $slots: any[] | undefined;
    $children: any[]
    props: AnyObj;
    componentState: string;
    $vNode: VElement | undefined;
    _data: AnyObj;
    _init() {
        this._proxyData(this._data);
        let code: string = '';
        if (this.config.ast) {
            code = createCode(this.config.ast, null);
        } else if (typeof this.config.render === 'function') {
            code = createCode(this.config.render(parseHTML, this), null);
        } else {
            throw new Error('缺少html视图模板，无法实例化组件');
        }

        this.$render = createFunction(code);
        this.$vNode = this._renderVnode();

        // 将组件dom缓存起来
        componentCache[this.cid] = this;

        // 自定义组件
        new Promise((resolve, reject) => {
            resolve();
        }).then(() => {
            if (typeof this.config.mounted === 'function' && this.componentState === UNCREATED) {
                this.componentState = CREATED;
                this.config.mounted.call(this);
            }
        });
    }
    _proxyData(data: AnyObj) {
        this.data = new Proxy(data, {
            get: (target: AnyObj, key: string, proxy: AnyObj) => {
                if (typeof (target[key]) === 'function') {
                    return target[key].bind(this)();
                }

                return target[key];
            },
            set: (target, key, value, proxy) => {
                throw new Error(`VUI 不允许直接对data赋值，否则可能会引起一些未知异常`);
            }
        });
    }
    _reRender() {
        // 当组件参数由render函数返回时，需每次都需要重新执行render函数
        if (typeof (this.config.render) === 'function') {
            let code: string = createCode(this.config.render(parseHTML, this), null);
            this.$render = createFunction(code);
        }

        const $newVNode = this._renderVnode({
            update: true
        });

        if (this.$vNode) {
            const patches = diff(this.$vNode, $newVNode);

            if (patches.length) {
                // console.log(patches);
                updateDom(patches);

                if (typeof this.config.updated === 'function') {
                    this.config.updated.call(this);
                }
            }
        }
    }
    _renderVnode(option = {}) {
        const methods: OnlyFunObj = {};

        Object.keys(this.config.methods).forEach(functionName => {
            // 绑定methods作用域
            methods[functionName] = this.config.methods[functionName].bind(this);
        });


        // 如果data中属性值是function则说明该属性为计算属性
        return this.$render.call({
            ...VuiFunc,
            props: this.props,
            state: this.$store ? this.$store.state : {},
            $vuip: this,
            // data: this.data,
            ...this.data,
            ...methods
        }, {
            update: false,
            ...option
        });
    }
    // 更新数据
    setData(updateData: AnyObj = {}, callback: () => {}) {
        this.renderEnd = false;

        for (let key in updateData) {
            this._data[key] = updateData[key];
        }

        // renderEnd 防止在一个事件循环中多次调用setData导致重复渲染
        new Promise((resolve) => {
            resolve();
        }).then(() => {
            if (!this.renderEnd) {
                this._reRender();
                this.renderEnd = true;
                callback && callback();
            }
        });
    }
    // 组件卸载
    uninstall() {
        if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }
        this.config.willUnmount.call(this);
        this.config.unmounted.call(this);

        // 从$parent的$children中删除已卸载组件
        let index = null;
        if (this.$parent) {
            this.$parent.$children.forEach((item, i) => {
                if (item === this) {
                    index = i;
                }
            });

            if (index !== null) {
                this.$parent.$children.splice(index, 1);
            }
        }

        // 子组件卸载
        this.$children.forEach(comp => {
            comp.uninstall();
        });
    }
}
