import { VElement } from './VuiElement';
import VuiComponent from './VuiComponent';
import { isArray, isUnd } from './uitls';

function replace(arr: any[], originItem: any, targetItem: any) {
    let index: any = undefined;
    arr.forEach((item, i) => {
        if (item === originItem) {
            index = i;
        }
    });

    if (isDef(index)) {
        arr.splice(index, 1, targetItem);
    }

    return arr;
}

const catchMap: { [x: string]: number } = {};

function levenshteinDistance(str1: string, str2: string) {
    let num = 0;
    let len1 = str1.length;
    let len2 = str2.length;

    if (catchMap[len1 + '_' + len2]) {
        return catchMap[len1 + '_' + len2];
    }

    if (str1 === str2) {
        num = 0;
    } else {
        if (str1 === undefined || str2 === undefined || len1 === 0 || len2 === 0) {
            num = Math.max(len1, len2);
        } else {
            if (str1[len1 - 1] === str2[len2 - 1]) {
                num = levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1));
            } else {
                num = Math.min(
                    levenshteinDistance(str1.substr(0, len1 - 1), str2),
                    levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1)),
                    levenshteinDistance(str1, str2.substr(0, len2 - 1))
                ) + 1;
            }
        }
    }
    catchMap[len1 + '_' + len2] = num;

    return num;
}

function walk(oldNode: VElement | VElement[], newNode: VElement | VElement[], patches: Patche[], point?: ((VElement | Array<VElement>)[])) {
    // 比较新旧节点
    if (Array.isArray(oldNode)) {
        diffChildren(oldNode, Array.isArray(newNode) ? newNode : [newNode], patches);
    } else if (Array.isArray(newNode)) {
        console.log('===================== 这边应该不会进来了===================')
        diffChildren(Array.isArray(oldNode) ? oldNode : [oldNode], newNode, patches);
    } else if (!Array.isArray(oldNode) && !Array.isArray(newNode)) {
        if (newNode === undefined) {
            patches.push({
                type: 'DELETE',
                weight: 8, // 权重，权重越大越优先更新
                oldNode,
                point
            });
        } else if (isUnd(oldNode.tagName) && isUnd(newNode.tagName)) {
            if (oldNode.text !== newNode.text) {
                patches.push({
                    type: 'TEXT',
                    weight: 1, // 权重，权重越大越优先更新
                    oldNode,
                    newNode
                });
            }
        } else if (!isUnd(oldNode.tagName) && oldNode.tagName === newNode.tagName) {
            if (oldNode.tagName.indexOf('component-') === 0 && oldNode.child && newNode.child) {
                // 如果遇到子组件
                // props 对比
                const oldProps = (oldNode.child as VuiComponent).$props;
                const newProps = newNode.child instanceof VuiComponent ? newNode.child.$props : newNode.child.props;
                let propsUpdate = false;

                Object.keys(oldProps).forEach(key => {
                    if (oldProps[key] !== newProps[key] && typeof oldProps[key] !== 'function') {
                        propsUpdate = true;
                        oldProps[key] = newProps[key];
                        (oldNode.child as VuiComponent).$proxyInstance.props[key] = newProps[key];
                    }

                    // 删除 props
                    if (!Object.keys(newProps).includes(key)) {
                        propsUpdate = true;
                        delete oldProps[key]
                        delete (oldNode.child as VuiComponent).$proxyInstance.props[key]
                    }
                });

                // 如果props有变化，则子组件需要重新render
                if (propsUpdate) {
                    // oldNode.child._reRender();
                    // (oldNode.child as VuiComponent).$proxyRender.props = oldProps;
                }

                // 父组件更新，子组件则全部更新，
                // fix 当引入vuipx时候，state变化时并不会引起挂载到组件上面的属性的变化，但如果子组件有引用到state时就无法更新视图
                /* if (oldNode.child instanceof VuiComponent) {
                    oldNode.child._reRender();
                } */

                diffChildren(oldNode.child.$slots || [], newNode.child.$slots || [], patches);
            } else {
                if (isDef(oldNode.attrs) && isDef(newNode.attrs)) {
                    // 属性对比
                    const oldAttrs = oldNode.attrs;
                    const newAttrs = newNode.attrs;
                    let attrsUpdate = false;

                    Object.keys(oldAttrs).forEach(key => {
                        if (oldAttrs[key] !== newAttrs[key]) {
                            attrsUpdate = true;
                        }

                        // 删除 props
                        if (!Object.keys(newAttrs).includes(key)) {
                            attrsUpdate = true;
                        }
                    });

                    // 如果props有变化，则子组件需要重新render
                    if (attrsUpdate) {
                        patches.push({
                            type: 'ATTRS',
                            weight: 2, // 权重，权重越大越优先更新
                            node: oldNode,
                            newAttrs,
                            oldAttrs
                        });
                    }
                }

                if (isDef(newNode.on)) {
                    patches.push({
                        type: 'EVENTS',
                        weight: 2, // 权重，权重越大越优先更新
                        node: oldNode,
                        on: newNode.on
                    });
                }

                if (Array.isArray(oldNode.children)) {
                    diffChildren(oldNode.children, Array.isArray(newNode.children) ? newNode.children : [], patches);
                }
            }
        } else if (oldNode.tagName !== newNode.tagName) {
            patches.push({
                type: 'REPLACE',
                weight: 9, // 权重，权重越大越优先更新
                oldNode,
                newNode,
                point
            });
        }
    }

    return patches.sort((a, b) => {
        return a.weight > b.weight ? -1 : 1;
    })
}

function isDef(v: any) {
    return v !== undefined && v !== null;
}

function diffChildren(oldChildren: (VElement | Array<VElement>)[], newChildren: (VElement | Array<VElement>)[], patches: Patche[]) {
    // let prevNode = null;
    // let currentIndex = index;

    oldChildren.forEach((child, i) => {
        if (isArray(child)) {
            walk(child, newChildren[i], patches, oldChildren);
        } else if (isArray(newChildren[i])) {
            oldChildren[i] = [(child as VElement)];
            walk(oldChildren[i], newChildren[i], patches, oldChildren);
        } else {
            walk(child, newChildren[i], patches, oldChildren);
        }
    });

    if (oldChildren.length < newChildren.length) {
        const patche: Patche = {
            type: 'ADD',
            weight: 10, // 权重，权重越大越优先更新
            prevNode: (oldChildren[oldChildren.length - 1] as VElement),
            newNodes: newChildren.slice(oldChildren.length, newChildren.length),
            point: oldChildren
        }
        patches.push(patche);
    }
}

function insertAfter(newElement: HTMLElement | DocumentFragment, targetElement: HTMLElement | Comment) {
    var parent: Node | null = targetElement.parentNode;
    //如果要插入的目标元素是其父元素的最后一个元素节点，直接插入该元素
    //否则，在目标元素的下一个兄弟元素之前插入
    if (parent) {
        if (parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }
}

// 组件卸载
function unmountComponent(vNode: VElement) {
    if (vNode.tagName && vNode.tagName.indexOf('component-') === 0) {
        let deleteIndex = null;
        vNode.context.$children.forEach((component, index) => {
            if (component === vNode.child) {
                deleteIndex = index;
            }
        });

        if (deleteIndex !== null && vNode.child) {
            // 如果有一个组件被卸载，则该组件下面的子组件会依次被卸载，无需再递归
            if (vNode.child instanceof VuiComponent) {
                vNode.child.uninstall();
            }
            return;
        }
    }


    if (Array.isArray(vNode.children)) {
        vNode.children.forEach(item => {
            unmountComponent(item);
        });
    }
}

interface Patche {
    type: string;
    weight: number;
    node?: VElement;
    prevNode?: VElement;
    oldNode?: VElement;
    newNode?: VElement;
    newNodes?: (VElement | Array<VElement>)[];
    newAttrs?: { [x: string]: string };
    oldAttrs?: { [x: string]: string };
    point?: (VElement | Array<VElement>)[] | undefined;
    on?: { [x: string]: () => {} }
}

export default function diff(oldVertualDom: VElement, newVertualDom: VElement) {
    let patches: Patche[] = []

    walk(oldVertualDom, newVertualDom, patches);

    return patches;
}


export function updateDom(patches: Patche[]) {
    patches.forEach(item => {
        if (item.type === 'TEXT' && item.oldNode && item.oldNode.elm && item.newNode) {
            // 更新文本
            item.oldNode.elm.textContent = item.newNode.text || '';
            item.oldNode.text = item.newNode.text;
            if (item.oldNode.elm.parentEl) {
                (item.oldNode.elm.parentEl as HTMLElement).innerHTML = item.newNode.text || '';
            }
        } else if (item.type === 'DELETE' && item.oldNode) {
            // 从dom中删除
            ((item.oldNode.elm as HTMLElement | Comment).parentNode as HTMLElement).removeChild(item.oldNode.elm as HTMLElement | Comment);
            // 从vnode中删除
            let deleteIndex: number = -1;
            if (item.point) {
                item.point.forEach((vd, index) => {
                    if (vd === item.oldNode) {
                        deleteIndex = index;
                    }
                });

                if (deleteIndex >= 0) {
                    item.point.splice(deleteIndex, 1);
                }
            }

            // 删除节点下面的所有组件
            unmountComponent(item.oldNode);
        } else if (item.type === 'REPLACE' && item.oldNode) {
            if (item.oldNode.elm) {
                ((item.oldNode.elm as HTMLElement | Comment).parentNode as HTMLElement).replaceChild((item.newNode as VElement).render(), item.oldNode.elm);
            }

            if (item.point) {
                replace(item.point, item.oldNode, item.newNode);
            }

            // 删除旧节点下的所有组件
            unmountComponent(item.oldNode);
        } else if (item.type === 'ADD' && item.newNodes) {
            // oldVDomMap[key].elm.parentNode.replaceChild(newVDomMap[key].render(), oldVDomMap[key].elm);
            const fragment = document.createDocumentFragment();
            item.newNodes.forEach((vNode) => {
                (vNode as VElement).parentVNode = item.prevNode?.parentVNode;
                fragment.appendChild((vNode as VElement).render());
            });

            if (item.prevNode) {
                insertAfter(fragment, (item.prevNode.elm as HTMLElement | Comment));
            }

            if (item.point) {
                item.point.push.apply(item.point, item.newNodes);
            }
        } else if (item.type === 'ATTRS' && item.node && item.newAttrs) {
            item.node.updateAttrs(item.newAttrs);
        } else if (item.type === 'EVENTS' && item.node && item.on) {
            item.node.on = item.on;
            item.node.updateListeners();
        }
    });
}