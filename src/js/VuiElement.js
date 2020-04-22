import VuiComponent from "./VuiComponent";

function createFnInvoker(fns, vm) {
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
    invoker.fns = fns;
    return invoker
}

function invokeWithErrorHandling(
    handler,
    args,
    vm,
) {
    var res;
    try {
        res = args ? handler.apply(vm, args) : handler.call(vm);
    } catch (e) {
        console.error(e);
    }
    return res
}

/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * @param context 标签所属组件上下文
 * */
class Element {
    constructor(tagName, option, children, context) {
        const { attrs, on } = option || {};
        this.tagName = tagName; // 标签名
        this.context = context; // dom 所在组件实例
        this.text = undefined; // 文本节点内容
        this.children = undefined; // 子节点
        this.on = on; // dom事件集合
        this.attrs = attrs; // dom属性集合

        // 如果 tagName === undefined ，则说明为文本节点，children为文本内容
        if (tagName === undefined) {
            this.text = children;
        } else if (tagName === 'comment') {
            // 注释节点
            this.text = children;
        } else if (tagName.indexOf('component-') === 0) {
            // 子组件，则children为子组件实例
            this.child = children;
        } else {
            // 普通标签节点
            this.children = children;
        }
    }

    render(parentEl) {
        let el = null;
        if (this.tagName === undefined) {
            // 创建文本节点
            el = document.createTextNode(this.text);
            el.parentEl = parentEl;
        } else if (this.tagName === 'comment') {
            // 创建注释节点，注释节点也是一个Dom
            el = document.createComment(this.text);
        } else if (this.tagName.indexOf('component-') === 0) {
            // 渲染子组件
            if (!(this.child instanceof VuiComponent)) {
                this.child = new VuiComponent(this.child);
                this.child.$parent.$children.push(this.child);
            }
            el = this.child.$vNode.render();
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

        // 事件绑定
        if (this.on) {
            Object.keys(this.on).forEach(eventName => {
                const cut = createFnInvoker(this.on[eventName], this.context);
                el.addEventListener(eventName, cut, false);
            })
        }

        // 处理子元素
        (this.children || []).forEach(child => {
            if (Array.isArray(child)) {
                // v-for、slot为数组
                child.forEach(_c => {
                    // 添加子元素到当前元素
                    el.appendChild(_c.render())
                });
            } else {
                // 添加子元素到当前元素
                if (this.attrs['v-html']) {
                    // 判断是否采用html渲染，如果是，则child.length === 1
                    if (this.children.length === 1 && child.tagName === undefined) {
                        child.render(el);
                        el.innerHTML = child.text; //(child.render());
                    } else {
                        throw new Error('v-html 标签下只能包含一个文本标签');
                    }
                } else {
                    el.appendChild(child.render());
                }
            }
        });
        return el;
    }
    // 更新节点属性
    updateAttrs(attrs) {
        this.attrs = attrs;
        this.setAttrs();
    }
    // 设置节点属性
    setAttrs() {
        // 节点属性设置
        if (this.attrs) {
            Object.keys(this.attrs).forEach(key => {
                let val = undefined;
                if (this.tagName === 'input' && key === 'value') {
                    this.elm.value = this.attrs[key];
                    return;
                } else if (this.tagName === 'img' && key === 'src' && this.attrs[key] && typeof this.attrs[key] === 'object') {
                    val = this.attrs[key].default;
                } else {
                    val = this.attrs[key];
                }

                this.elm.setAttribute(key, val);
            });
        }
    }
}


function normalizeChildren(children) {
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
}


/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * */
export function createElement(tagName, option, children) {
    // 返回虚拟Dom实例
    return new Element(tagName, option, children, this.$vuip);
};