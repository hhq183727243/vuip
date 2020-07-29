import VuiComponent from "./VuiComponent";
import { ComponentOptions, AnyObj } from './interface';

function createFnInvoker(fns: Function, vm: VuiComponent) {
    function invoker() {
        var arguments$1 = arguments;

        var fns = invoker.fns;
        if (Array.isArray(fns)) {
            var cloned = fns.slice();
            for (var i = 0; i < cloned.length; i++) {
                invokeWithErrorHandling(cloned[i], arguments$1, vm);
            }
        } else {
            // return handler return value for single handlers
            return invokeWithErrorHandling(fns, arguments, vm)
        }
    }
    invoker.remove = () => { };
    invoker.fns = fns;
    return invoker
}

function invokeWithErrorHandling(
    handler: any,
    args: any,
    vm: VuiComponent,
) {
    var res;
    try {
        res = args ? handler.apply(vm, args) : handler.call(vm);
    } catch (e) {
        console.error(e);
    }
    return res
}

interface VElementParam {
    tagName: string,
    option: AnyObj | null,
    children: Children,
    context: VuiComponent
}

type _Element = HTMLElement | Text | Comment;


interface FunInvoker {
    fns: Function,
    remove: Function,
}
declare global {
    interface Text {
        parentEl: _Element
    }
    interface Comment {
        parentEl: _Element
    }
    interface HTMLElement {
        parentEl: _Element
    }
}

function setParentVNode(parent: VElement, children: VElement[]) {
    // 为子节点设置父节点
    children.forEach(item => {
        if (Array.isArray(item)) {
            setParentVNode(parent, item);
        } else {
            item.parentVNode = parent;
        }
    });
}

/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * @param context 标签所属组件上下文
 * */
export class VElement {
    constructor(options: VElementParam) {
        const { tagName, option, children, context } = options;
        const { attrs, on } = option || {};
        this.parentVNode = undefined;
        this.tagName = tagName; // 标签名
        this.context = context; // dom 所在组件实例
        this.text = undefined; // 文本节点内容
        this.children = undefined; // 子节点
        this.on = on; // dom事件集合
        this.attrs = attrs; // dom属性集合
        this.events = {};
        // 如果 tagName === undefined ，则说明为文本节点，children为文本内容
        if (tagName === undefined && typeof children === 'string') {
            this.text = children;
        } else if (tagName === 'comment') {
            // 注释节点
            this.text = children?.toString();
        } else if (tagName.indexOf('component-') === 0) {
            // 子组件，则children为子组件实例
            this.child = children as VuiComponent | ComponentOptions;
        } else {
            // 普通标签节点
            this.children = children;

            // 为子节点设置父节点
            setParentVNode(this, this.children as VElement[]);
        }
    }
    parentVNode: VElement | undefined;
    tagName: string;
    context: VuiComponent;
    text?: string | undefined;
    children: Children;
    on: { [x: string]: () => {} };
    attrs: AnyObj;
    child?: VuiComponent | ComponentOptions;
    elm?: _Element;
    render(parentEl?: _Element): _Element {
        let el: _Element;

        if (this.tagName === undefined) {
            // 创建文本节点
            el = document.createTextNode((this.text as string));
            if (parentEl) {
                el.parentEl = parentEl;
            }
        } else if (this.tagName === 'comment') {
            // 创建注释节点，注释节点也是一个Dom
            el = document.createComment(this.text || 'undefined');
        } else if (this.tagName.indexOf('component-') === 0) {
            // 渲染子组件
            if (this.child && !(this.child instanceof VuiComponent)) {
                this.child = new VuiComponent(this.child);

                /* if (this.child.$parent) {
                    // 将组件添加到付组件实例的$children中
                    this.child.$parent.$children.push(this.child);
                } */
            }
            // 设置组件实例所对应的VElement实例2020-7-27 14:18:44
            (this.child as VuiComponent).$parentVNode = this;
            el = (this.child as VuiComponent).$el as HTMLElement;
        } else {
            // 普通标签节点
            el = document.createElement(this.tagName);
        }

        // 将组件顶级节点挂载到组件实例上，用于后面组件卸载移除对应dom操作
        if (!this.context.$el) {
            this.context.$el = el;
        }

        this.elm = el; // 虚拟节点对应的DOM节点

        this.setAttrs();
        this.updateListeners();

        /* if (this.attrs && this.attrs['v-model']) {
            el.addEventListener('input', (e: Event) => {
                console.log(e);
            }, false);
        } */

        // 渲染列表
        this.renderVList(el, this.children);

        return el;
    }
    renderVList(parentEl: _Element, els: Children) {
        // 处理子元素
        if (Array.isArray(els)) {
            els.forEach((child: VElement) => {
                if (Array.isArray(child)) {
                    // v-for、slot为数组
                    child.forEach(_c => {
                        // 添加子元素到当前元素
                        if (Array.isArray(_c)) {
                            this.renderVList(parentEl, _c);
                        } else {
                            parentEl.appendChild(_c.render())
                        }
                    });
                } else {
                    // 添加子元素到当前元素
                    if (this.attrs['v-html'] && Array.isArray(this.children)) {
                        // 判断是否采用html渲染，如果是，则child.length === 1
                        if (this.children && this.children.length === 1 && child.tagName === undefined) {
                            child.render(parentEl);
                            (parentEl as HTMLElement).innerHTML = (child.text || ''); //(child.render());
                        } else {
                            throw new Error('v-html 标签下只能包含一个文本标签');
                        }
                    } else {
                        parentEl.appendChild(child.render());
                    }
                }
            });
        }
    }
    events: { [x: string]: FunInvoker };//Array<Function>;
    updateListeners() {
        // 解除事件
        /*  this.events.forEach(func => {
            func();
        }); */
        const el = this.elm as HTMLElement;

        // 事件绑定
        for (let key in (this.on || {})) {
            const eventName = key.replace(/_.*/, ''); // 去除eventUid后缀

            if (!this.events[key] || !this.events[key].fns) {
                // 如果有新事件则进行绑定
                const cut = createFnInvoker(this.on[key], this.context);
                cut.remove = this.addEventListener(el, eventName, cut);
                this.events[key] = cut;
            } else {
                // 否则触发函数替换为最新函数
                this.events[key].fns = this.on[key];
            }
        }

        // 卸载无用旧事件
        for (let key in this.events) {
            if (!this.on[key]) {
                this.events[key].remove();
            }
        }
    }
    addEventListener(el: HTMLElement, on: string, func: () => {}, capture: boolean = false) {
        el.addEventListener(on, func, capture);

        // 添加事件移除操作
        return () => {
            el.removeEventListener(on, func);
        }
    }
    // 更新节点属性
    updateAttrs(attrs: AnyObj) {
        this.attrs = attrs;
        this.setAttrs();
    }
    // 设置节点属性
    setAttrs() {
        // 节点属性设置
        if (this.attrs) {
            Object.keys(this.attrs).forEach(key => {
                let val = undefined;

                // ref 节点收集
                if (key === 'ref') {
                    this.context.$refs[this.attrs[key]] = this.elm;
                    return;
                }

                if (key === 'value' && this.tagName === 'input' && this.attrs['type'] === 'text') {
                    (this.elm as HTMLInputElement).value = this.attrs[key];
                    return;
                }

                if (key === 'checked' && this.tagName === 'input' && (this.attrs['type'] === 'radio' || this.attrs['type'] === 'checkbox')) {
                    (this.elm as HTMLInputElement).checked = this.attrs[key];
                    return;
                }

                if (this.tagName === 'img' && key === 'src' && this.attrs[key] && typeof this.attrs[key] === 'object') {
                    val = this.attrs[key].default;
                } else {
                    val = this.attrs[key];
                }

                if (this.elm) {
                    (this.elm as HTMLElement).setAttribute(key, val);
                }
            });
        }
    }
}

/* function normalizeChildren(children) {
    var arr = [];

    children.forEach(item => {
        if (Array.isArray(item)) {
            if (item._isVlist) {
                item.forEach((vn, i) => {
                    vn.key = '__vlist_' + item._index + '_' + i
                });
            }
            arr.push.apply(arr, item);
        } else {
            arr.push(item);
        }
    });

    return arr;
} */

type Children = VElement[] | VuiComponent | ComponentOptions | string | undefined;

/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * */
export function createElement(tagName: string, option: AnyObj | null, children: Children, $vuip: VuiComponent) {
    // 返回虚拟Dom实例
    const options: VElementParam = {
        tagName,
        option,
        children,
        context: $vuip
    }
    return new VElement(options);
};