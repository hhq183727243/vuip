"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var VuiComponent_1 = __importDefault(require("./VuiComponent"));
function replace(arr, originItem, targetItem) {
    var index = undefined;
    arr.forEach(function (item, i) {
        if (item === originItem) {
            index = i;
        }
    });
    if (isDef(index)) {
        arr.splice(index, 1, targetItem);
    }
    return arr;
}
var catchMap = {};
function levenshteinDistance(str1, str2) {
    var num = 0;
    var len1 = str1.length;
    var len2 = str2.length;
    if (catchMap[len1 + '_' + len2]) {
        return catchMap[len1 + '_' + len2];
    }
    if (str1 === str2) {
        num = 0;
    }
    else {
        if (str1 === undefined || str2 === undefined || len1 === 0 || len2 === 0) {
            num = Math.max(len1, len2);
        }
        else {
            if (str1[len1 - 1] === str2[len2 - 1]) {
                num = levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1));
            }
            else {
                num = Math.min(levenshteinDistance(str1.substr(0, len1 - 1), str2), levenshteinDistance(str1.substr(0, len1 - 1), str2.substr(0, len2 - 1)), levenshteinDistance(str1, str2.substr(0, len2 - 1))) + 1;
            }
        }
    }
    catchMap[len1 + '_' + len2] = num;
    return num;
}
function walk(oldNode, newNode, patches, point) {
    // 比较新旧节点
    if (Array.isArray(oldNode)) {
        diffChildren(oldNode, Array.isArray(newNode) ? newNode : [], patches);
    }
    else if (!Array.isArray(oldNode) && !Array.isArray(newNode)) {
        if (newNode === undefined) {
            patches.push({
                type: 'DELETE',
                weight: 8,
                oldNode: oldNode,
                point: point
            });
        }
        else if (oldNode.tagName === newNode.tagName) {
            if (oldNode.tagName === undefined) {
                if (oldNode.text !== newNode.text) {
                    patches.push({
                        type: 'TEXT',
                        weight: 1,
                        oldNode: oldNode,
                        newNode: newNode
                    });
                }
            }
            else {
                if (oldNode.tagName.indexOf('component-') === 0 && oldNode.child && newNode.child) {
                    // 如果遇到子组件
                    // props 对比
                    var oldProps_1 = oldNode.child.$props;
                    var newProps_1 = newNode.child instanceof VuiComponent_1.default ? newNode.child.$props : newNode.child.props;
                    var propsUpdate_1 = false;
                    Object.keys(oldProps_1).forEach(function (key) {
                        if (oldProps_1[key] !== newProps_1[key] && typeof oldProps_1[key] !== 'function') {
                            propsUpdate_1 = true;
                            oldProps_1[key] = newProps_1[key];
                            oldNode.child.$proxyRender.props[key] = newProps_1[key];
                        }
                        // 删除 props
                        if (!Object.keys(newProps_1).includes(key)) {
                            propsUpdate_1 = true;
                            delete oldProps_1[key];
                            delete oldNode.child.$proxyRender.props[key];
                        }
                    });
                    // 如果props有变化，则子组件需要重新render
                    if (propsUpdate_1) {
                        // oldNode.child._reRender();
                        // (oldNode.child as VuiComponent).$proxyRender.props = oldProps;
                    }
                    // 父组件更新，子组件则全部更新，
                    // fix 当引入vuipx时候，state变化时并不会引起挂载到组件上面的属性的变化，但如果子组件有引用到state时就无法更新视图
                    /* if (oldNode.child instanceof VuiComponent) {
                        oldNode.child._reRender();
                    } */
                    diffChildren(oldNode.child.$slots || [], newNode.child.$slots || [], patches);
                }
                else {
                    if (isDef(oldNode.attrs) && isDef(newNode.attrs)) {
                        // 属性对比
                        var oldAttrs_1 = oldNode.attrs;
                        var newAttrs_1 = newNode.attrs;
                        var attrsUpdate_1 = false;
                        Object.keys(oldAttrs_1).forEach(function (key) {
                            if (oldAttrs_1[key] !== newAttrs_1[key]) {
                                attrsUpdate_1 = true;
                            }
                            // 删除 props
                            if (!Object.keys(newAttrs_1).includes(key)) {
                                attrsUpdate_1 = true;
                            }
                        });
                        // 如果props有变化，则子组件需要重新render
                        if (attrsUpdate_1) {
                            patches.push({
                                type: 'ATTRS',
                                weight: 2,
                                node: oldNode,
                                newAttrs: newAttrs_1,
                                oldAttrs: oldAttrs_1
                            });
                        }
                    }
                    if (Array.isArray(oldNode.children)) {
                        diffChildren(oldNode.children, Array.isArray(newNode.children) ? newNode.children : [], patches);
                    }
                }
            }
        }
        else if (oldNode.tagName !== newNode.tagName) {
            patches.push({
                type: 'REPLACE',
                weight: 9,
                oldNode: oldNode,
                newNode: newNode,
                point: point
            });
        }
    }
    return patches.sort(function (a, b) {
        return a.weight > b.weight ? -1 : 1;
    });
}
function isDef(v) {
    return v !== undefined && v !== null;
}
function diffChildren(oldChildren, newChildren, patches) {
    // let prevNode = null;
    // let currentIndex = index;
    oldChildren.forEach(function (child, i) {
        // currentIndex = (prevNode && prevNode.count) ? (prevNode.count + currentIndex + 1) : (currentIndex + 1);
        //v-for 对比
        /* if (isDef(child.key)) {
        } */
        walk(child, newChildren[i], patches, oldChildren);
        // prevNode = child;
    });
    if (oldChildren.length < newChildren.length) {
        var patche = {
            type: 'ADD',
            weight: 10,
            prevNode: oldChildren[oldChildren.length - 1],
            newNodes: newChildren.slice(oldChildren.length, newChildren.length),
            point: oldChildren
        };
        patches.push(patche);
    }
}
function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    //如果要插入的目标元素是其父元素的最后一个元素节点，直接插入该元素
    //否则，在目标元素的下一个兄弟元素之前插入
    if (parent) {
        if (parent.lastChild == targetElement) {
            parent.appendChild(newElement);
        }
        else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }
}
// 组件卸载
function unmountComponent(vNode) {
    if (vNode.tagName && vNode.tagName.indexOf('component-') === 0) {
        var deleteIndex_1 = null;
        vNode.context.$children.forEach(function (component, index) {
            if (component === vNode.child) {
                deleteIndex_1 = index;
            }
        });
        if (deleteIndex_1 !== null && vNode.child) {
            // 如果有一个组件被卸载，则该组件下面的子组件会依次被卸载，无需再递归
            if (vNode.child instanceof VuiComponent_1.default) {
                vNode.child.uninstall();
            }
            return;
        }
    }
    if (Array.isArray(vNode.children)) {
        vNode.children.forEach(function (item) {
            unmountComponent(item);
        });
    }
}
function diff(oldVertualDom, newVertualDom) {
    var patches = [];
    walk(oldVertualDom, newVertualDom, patches);
    return patches;
}
exports.default = diff;
function updateDom(patches) {
    patches.forEach(function (item) {
        if (item.type === 'TEXT' && item.oldNode && item.oldNode.elm && item.newNode) {
            // 更新文本
            item.oldNode.elm.textContent = item.newNode.text || '';
            item.oldNode.text = item.newNode.text;
            if (item.oldNode.elm.parentEl) {
                item.oldNode.elm.parentEl.innerHTML = item.newNode.text || '';
            }
        }
        else if (item.type === 'DELETE' && item.oldNode) {
            // 从dom中删除
            item.oldNode.elm.parentNode.removeChild(item.oldNode.elm);
            // 从vnode中删除
            var deleteIndex_2 = -1;
            if (item.point) {
                item.point.forEach(function (vd, index) {
                    if (vd === item.oldNode) {
                        deleteIndex_2 = index;
                    }
                });
                if (deleteIndex_2 >= 0) {
                    item.point.splice(deleteIndex_2, 1);
                }
            }
            // 删除节点下面的所有组件
            unmountComponent(item.oldNode);
        }
        else if (item.type === 'REPLACE' && item.oldNode) {
            if (item.oldNode.elm) {
                item.oldNode.elm.parentNode.replaceChild(item.newNode.render(), item.oldNode.elm);
            }
            if (item.point) {
                replace(item.point, item.oldNode, item.newNode);
            }
            // 删除旧节点下的所有组件
            unmountComponent(item.oldNode);
        }
        else if (item.type === 'ADD' && item.newNodes) {
            // oldVDomMap[key].elm.parentNode.replaceChild(newVDomMap[key].render(), oldVDomMap[key].elm);
            var fragment_1 = document.createDocumentFragment();
            item.newNodes.forEach(function (vd) {
                fragment_1.appendChild(vd.render());
            });
            if (item.prevNode) {
                insertAfter(fragment_1, item.prevNode.elm);
            }
            if (item.point) {
                item.point.push.apply(item.point, item.newNodes);
            }
        }
        else if (item.type === 'ATTRS' && item.node && item.newAttrs) {
            item.node.updateAttrs(item.newAttrs);
        }
    });
}
exports.updateDom = updateDom;
