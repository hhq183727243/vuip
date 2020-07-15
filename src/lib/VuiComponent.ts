import diff, { updateDom } from './VuiDiff';
import Depend from './Depend';
import Watcher from './Watcher';
import VuiFunc from './VuiFunc';
import parseHTML from './parseHTML';
import createCode from './VuiCreateCode';
import { VElement } from './VuiElement';
import { ComponentOptions, ComponentConfig, Lifecycle, AnyObj } from './interface';
import { isObject, warn, isUnd, isFunc } from './uitls';
import proxyObj from './proxy';

const UNCREATED: string = 'UNCREATED';
const CREATED: string = 'CREATED';
// const componentCache: {
//     [x: string]: VuiComponent
// } = {};

let cid = 0;

function createFunction(code: string) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}

const lifecycleFun = (name: string) => {
    return () => {
        // console.log(name)
    }
};

const lifecycleDefault: Lifecycle = {
    // new Vuip 一个钩子
    willCreate: lifecycleFun('willCreate'),
    // new Vuip 实例属性设置完成
    created: lifecycleFun('created'),
    // 
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
        this._options = Object.assign({
            methods: {},
            data() { return {} },
        }, lifecycleDefault, options);

        this.componentName = this._options.name;
        this.watcher = null;
        this.watchers = [];
        this.$el = null;
        this.$refs = {};
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.$props = props;
        this._componentState = UNCREATED; // 组件状态
        this._updateDate = {}; // 更新数据集合 
        this._updating = false; // this.setData 是否在更新中
        this._updatedCallback = []; // this.setData回调集合
        this.$computed = {};
        this.$proxyRender = {
            $vuip: this
        }; // 代理render作用域
        this.$proxyInstance = {}; // 代理实例
        this._options.willCreate.call(this);
        this._initProxyInstance();
        this._initStore();
        this._initProps();
        this._initData();
        this._initMethods();
        this._initProxyRender();
        this._options.created.call(this.$proxyInstance);

        this._mount();
    }
    $computed: AnyObj;
    $proxyRender: AnyObj; // 代理对象
    $proxyInstance: AnyObj; // 代理对象
    [x: string]: any; // 动态添加属性
    cid: number;
    watcher: Watcher | null;
    watchers: Array<Watcher>;
    componentName: string;
    _options: ComponentConfig;
    $el: Element | Text | Comment | null;
    $refs: AnyObj; //el节点引用
    $parent: VuiComponent | undefined;
    $slots: any[] | undefined;
    $children: any[]
    $props: AnyObj;
    _componentState: string;
    $vNode: VElement | undefined;
    _updateDate: AnyObj;
    // _data: AnyObj;
    _initProxyInstance() {
        // 代理实例
        this.$proxyInstance = new Proxy(this, {
            get: (target: AnyObj, key: string, proxy: AnyObj) => {
                if (!isUnd(target[key])) {
                    return target[key];
                }

                if (!isUnd(target.$proxyRender[key])) {
                    return target.$proxyRender[key];
                }

                return target[key];
            },
            set: (target: AnyObj, key: string, value: any, receiver: any): boolean => {
                // throw new Error(`VUIP 不允许直接对实例赋值`);
                target[key] = value;
                return true;
            }
        });
    }
    // 全局状态
    _initStore() {
        if (this.$store) {
            this.$proxyRender[this.$store.aliasName] = this.$store.state;
        }
    }
    _initProps() {
        this.$proxyRender.props = {};

        for (let key in this.$props) {
            this.$proxyRender.props[key] = this.$props[key];
        }
    }
    _initData() {
        let data: AnyObj = {};
        if (typeof this._options.data === 'function') {
            data = this._options.data();

            if (!isObject(data)) {
                warn('data 必须放回一个{}格式对象');
                data = {};
            }
        } else {
            warn('data 必须是一个函数，且返回一个{}对象');
            data = {};
        }

        for (let key in data) {
            if (isUnd(this.$proxyRender[key]) && isUnd(this[key])) {
                if (isFunc(data[key])) {
                    this.$computed[key] = data[key];
                } else {
                    this.$proxyRender[key] = data[key];
                }
            } else {
                warn(`data 属性【${key}】与实例属性命名冲突`);
            }
        }
    }
    _initMethods() {
        for (let funName in VuiFunc) {
            this.$proxyRender[funName] = VuiFunc[funName];
        }

        for (let funName in this._options.methods) {
            if (isUnd(this.$proxyRender[funName]) && isUnd(this[funName])) {
                this.$proxyRender[funName] = this._options.methods[funName].bind(this.$proxyInstance);
            } else {
                warn(`methods 方法名【${funName}】与实例属性命名冲突，或在data中定义过`);
            }
        }
    }
    _initProxyRender() {
        // 代理render作用域
        this.$proxyRender = proxyObj(this.$proxyRender);

        for (let key in this.$computed) {
            this.$proxyRender[key] = new Watcher(this, () => {
                return this.$computed[key].call(this.$proxyInstance)
            });
        }
    }
    _mount() {
        // 构建codeStr
        let code: string = '';
        if (this._options.ast) {
            code = createCode(this._options.ast, null, []);
        } else if (typeof this._options.render === 'function') {
            code = createCode(this._options.render(parseHTML, this.$proxyInstance), null, []);
        } else {
            code = createCode({ type: 1, tagName: 'comment' }, null, []);
            warn('缺少html视图模板');
        }
        // 生成render函数
        this.$render = createFunction(code);
        // 装载组件
        this._mountComponent();
    }
    _renderVnode(option = {}): VElement {
        // 如果data中属性值是function则说明该属性为计算属性
        // this.$proxyRender.state = this.$store ? this.$store.state : {};

        // 当组件参数由render函数返回时，需每次都需要重新执行render函数
        if (typeof (this._options.render) === 'function') {
            let code: string = createCode(this._options.render(parseHTML, this.$proxyInstance), null, []);
            this.$render = createFunction(code);
        }

        return this.$render.call(this.$proxyRender, {
            update: this._componentState === CREATED, // 初次创建还是更新创建
            ...option
        });
    }

    // 装载组件
    _mountComponent() {
        this._options.willMount.call(this.$proxyInstance);

        const mount = () => {
            this._update(this._renderVnode());
        }

        // 为mount添加观察者
        new Watcher(this, mount, true);

        // 将组件dom缓存起来
        // componentCache[this.cid] = this;

        // 自定义组件
        this._componentState = CREATED;
        // 挂载完毕
        this._options.mounted.call(this.$proxyInstance);
    }
    _update(vnode: VElement) {
        if (this._componentState === UNCREATED) {
            // 首次render
            this.$vNode = vnode;
            // 创建虚拟Dom
            this.$el = (this.$vNode as VElement).render();
        } else {
            // 组件更新
            this._options.willUpdate.call(this.$proxyInstance);

            const $newVNode: VElement = vnode;

            if (this.$vNode) {
                const patches = diff(this.$vNode, $newVNode);

                if (patches.length) {
                    // console.log(patches);
                    updateDom(patches);

                    if (typeof this._options.updated === 'function') {
                        this._options.updated.call(this.$proxyInstance);
                    }
                }
            }
        }
    }
    _updating: boolean;
    _updatedCallback: Array<Function>;
    // 更新数据
    setData(data: AnyObj = {}, callback: () => {}) {
        this._updating = false;

        if (!isObject(data)) {
            warn('setData必须接收一个{}对象参数');
            return;
        }
        for (let key in data) {
            this._updateDate[key] = data[key]; // 要更新的数据
        }

        if (isFunc(callback)) {
            this._updatedCallback.push(callback);
        }

        // _updating 防止在一个事件循环中多次调用setData导致重复渲染
        if (!this._updating) {
            this._updating = true;

            new Promise((resolve) => {
                resolve();
            }).then(() => {
                // this._reRender();
                for (let key in this._updateDate) {
                    // this.data[key] = data[key]; // 同步到this.data
                    this.$proxyRender[key] = this._updateDate[key];
                }
                this._updateDate = {};
                this._updating = false;
                const callbacks = this._updatedCallback;
                setTimeout(() => {
                    callbacks.forEach(func => {
                        try {
                            func();
                        } catch (error) {
                            warn(error);
                        }
                    });
                }, 0);
                this._updatedCallback = [];
            });
        }
    }
    // 组件卸载
    uninstall() {
        this._options.willUnmount.call(this.$proxyInstance);

        // 节点移除
        if (this.$el && this.$el.parentNode) {
            this.$el.parentNode.removeChild(this.$el);
        }

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
        const $children = this.$children;
        // 如果父组件卸载，则所有子组件都会被卸载，因此为this.$children = []
        this.$children = [];
        // 子组件卸载
        $children.forEach(comp => {
            comp.uninstall();
        });

        this._options.unmounted.call(this.$proxyInstance);
    }
}
