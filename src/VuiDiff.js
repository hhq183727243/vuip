
const catchMap = {};

Array.prototype.replace = function (originItem, targetItem) {
    let index = null;
    this.forEach((item, i) => {
        if (item === originItem) {
            index = i;
        }
    });

    if (isDef(index)) {
        this.splice(index, 1, targetItem);
    }

    return this;
}

function levenshteinDistance(str1, str2) {
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

function walk(oldNode, newNode, patches, point) {
    // 比较新旧节点
    if (Array.isArray(oldNode)) {
        diffChildren(oldNode || [], newNode || [], patches);
    } else if (newNode === undefined) {
        patches.push({
            type: 'DELETE',
            oldNode,
            point
        });
    } else if (oldNode.tagName === newNode.tagName) {
        if (oldNode.tagName === undefined) {
            if (oldNode.text !== newNode.text) {
                patches.push({
                    type: 'TEXT',
                    oldNode,
                    newNode
                });
            }
        } else {
            if (oldNode.tagName.indexOf('component-') === 0) {
                // 如果遇到子组件
                // props 对比
                const oldProps = oldNode.child.props;
                const newProps = newNode.child.props;
                let propsUpdate = false;

                Object.keys(oldProps).forEach(key => {
                    if (oldProps[key] !== newProps[key] && typeof oldProps[key] !== 'function') {
                        propsUpdate = true;
                        oldProps[key] = newProps[key];
                    }

                    // 删除 props
                    if (!Object.keys(newProps).includes(key)) {
                        propsUpdate = true;
                        delete oldProps[key]
                    }
                });

                // 如果props有变化，则子组件需要重新render
                if (propsUpdate) {
                    oldNode.child._reRender();
                }

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
                            node: oldNode,
                            newAttrs,
                            oldAttrs
                        });
                    }
                }

                diffChildren(oldNode.children || [], newNode.children || [], patches);
            }
        }
    } else if (oldNode.tagName !== newNode.tagName) {
        patches.push({
            type: 'REPLACE',
            oldNode,
            newNode,
            point
        });
    }

    return patches
}

function isDef(v) {
    return v !== undefined && v !== null;
}

function diffChildren(oldChildren, newChildren, patches) {
    // let prevNode = null;
    // let currentIndex = index;

    oldChildren.forEach((child, i) => {
        // currentIndex = (prevNode && prevNode.count) ? (prevNode.count + currentIndex + 1) : (currentIndex + 1);
        //v-for 对比
        /* if (isDef(child.key)) {
        } */
        walk(child, newChildren[i], patches, oldChildren);
        // prevNode = child;
    });

    if (oldChildren.length < newChildren.length) {
        patches.push({
            type: 'ADD',
            prevNode: oldChildren[oldChildren.length - 1],
            newNodes: newChildren.slice(oldChildren.length, newChildren.length),
            point: oldChildren
        });
    }
}

function insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode;
    //如果要插入的目标元素是其父元素的最后一个元素节点，直接插入该元素
    //否则，在目标元素的下一个兄弟元素之前插入
    if (parent.lastChild == targetElement) {
        parent.appendChild(newElement);
    } else {
        parent.insertBefore(newElement, targetElement.nextSibling);
    }
}

// 组件卸载
function unmountComponent(vNode) {
    if (vNode.tagName && vNode.tagName.indexOf('component-') === 0) {
        let deleteIndex = null;
        vNode.context.$children.forEach((component, index) => {
            if (component === vNode.child) {
                deleteIndex = index;
            }
        });

        if (deleteIndex !== null) {
            vNode.child.config.willUnmount.call(vNode.child);
            vNode.context.$children.splice(deleteIndex, 1);
            vNode.child.config.unmounted.call(vNode.child);
        }
    }

    if (vNode.children && vNode.children.length) {
        vNode.children.forEach(item => {
            unmountComponent(item);
        });
    }
}

export default function diff(oldVertualDom, newVertualDom) {
    let patches = []

    walk(oldVertualDom, newVertualDom, patches);

    return patches;
}

export function updateDom(patches) {
    patches.forEach(item => {
        if (item.type === 'TEXT') {
            // 更新文本
            item.oldNode.elm.textContent = item.newNode.text;
            item.oldNode.text = item.newNode.text;
            if (item.oldNode.elm.parentEl) {
                item.oldNode.elm.parentEl.innerHTML = item.newNode.text;
            }
        } else if (item.type === 'DELETE') {
            // 从dom中删除
            item.oldNode.elm.parentNode.removeChild(item.oldNode.elm);
            // 从vnode中删除
            let deleteIndex = null;
            item.point.forEach((vd, index) => {
                if (vd === item.oldNode) {
                    deleteIndex = index;
                }
            });
            item.point.splice(deleteIndex, 1);

            // 删除节点下面的所有组件
            unmountComponent(item.oldNode);
        } else if (item.type === 'REPLACE') {
            item.oldNode.elm.parentNode.replaceChild(item.newNode.render(), item.oldNode.elm);
            item.point.replace(item.oldNode, item.newNode);

            // 删除旧节点下的所有组件
            unmountComponent(item.oldNode);
        } else if (item.type === 'ADD') {
            // oldVDomMap[key].elm.parentNode.replaceChild(newVDomMap[key].render(), oldVDomMap[key].elm);
            const fragment = document.createDocumentFragment();
            item.newNodes.forEach(vd => {
                fragment.appendChild(vd.render());
            });
            insertAfter(fragment, item.prevNode.elm);

            item.point.push.apply(item.point, item.newNodes);
        } else if (item.type === 'ATTRS') {
            item.node.updateAttrs(item.newAttrs);
        }
    });
}