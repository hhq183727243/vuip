/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Vuip.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/VuiComponent.js":
/*!*****************************!*\
  !*** ./src/VuiComponent.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _VuiDiff = __webpack_require__(/*! ./VuiDiff.js */ "./src/VuiDiff.js");

var _VuiDiff2 = _interopRequireDefault(_VuiDiff);

var _VuiFunc = __webpack_require__(/*! ./VuiFunc.js */ "./src/VuiFunc.js");

var _VuiFunc2 = _interopRequireDefault(_VuiFunc);

var _parseHTML = __webpack_require__(/*! ./parseHTML */ "./src/parseHTML.js");

var _parseHTML2 = _interopRequireDefault(_parseHTML);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UNCREATED = 'UNCREATED';
var CREATED = 'CREATED';
var componentCache = {};
var EVENTS = ['onclick', 'onchange', 'onscroll'];

var cid = 0;

function parseFun(value) {
    if (!value) {
        throw new Error('事件绑定错误');
    }

    var reg = /^(\w+)\s*\(?\s*([\w,\.\s]*)\s*\)?$/;
    var regRes = value.match(reg);
    var name = regRes[1];
    var params = regRes[2];

    return {
        name: name,
        params: params
    };
}

// v-if v-elseif 系列中只要之前条件满足一个，之后都不渲染
var conditions = [];
/**
 * 构建创建dom代码
 * @param option 当前节点配置
 * @param prevOption 上一个节点,用来处理v-if, v-elseif, v-else指令
 */
function createCode(option, prevOption) {
    var type = option.type,
        content = option.content,
        tagName = option.tagName,
        _option$attr = option.attr,
        attr = _option$attr === undefined ? {} : _option$attr,
        children = option.children;

    var childCode = [];

    (children || []).forEach(function (item, index) {
        childCode.push(createCode(item, index > 0 ? children[index - 1] : null));
    });

    var _attrStr = '{';
    var _eventStr = '';
    Object.keys(attr).forEach(function (key, index) {
        if (EVENTS.includes(key)) {
            var _parseFun = parseFun(attr[key]),
                name = _parseFun.name,
                params = _parseFun.params;

            _eventStr += '"' + key.replace('on', '') + '": function($event){ return this.' + name + '(' + (/\w/.test(params) ? params + ',' : '') + '$event)},';
        } else if (key.indexOf('v-on:') === 0 && type === 3) {
            // 父子组件通信
            var _parseFun2 = parseFun(attr[key]),
                _name = _parseFun2.name,
                _params = _parseFun2.params;

            _attrStr += '"' + key.replace(/^v-on:?/, '') + '": function(a,b,c,d,e,f){ return $vuip.' + _name + '(' + (/\w/.test(_params) ? _params + ',' : '') + 'a,b,c,d,e,f)},'; // :开头说明是表达式
        } else {
            if (key.indexOf(':') === 0) {
                _attrStr += '"' + key.replace(/^:?/, '') + '": ' + attr[key] + ','; // :开头说明是表达式
            } else {
                _attrStr += '"' + key + '": "' + attr[key] + '",'; // 否则是字符串
            }
        }
    });
    _attrStr += '}';
    _eventStr = _eventStr !== '' ? '{' + _eventStr + '}' : '';
    var _objStr = '{"attrs": ' + _attrStr + (_eventStr !== '' ? ', "on": ' + _eventStr : '') + '}';

    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots()';
        } else {
            return 'createElement("' + tagName + '", ' + _objStr + ',[' + childCode.join(',') + '])';
        }
    } else if (type === 2) {
        // 文本节点
        return 'createElement(undefined, null, ' + textParse(content.replace(/\r\n|\r|\n/g, '')) + ')';
    } else if (type === 3) {
        // 组件
        return 'createComponent("' + tagName + '", ' + _attrStr + ',[' + childCode.join(',') + '], __option__)';
    } else if (type === 4) {
        // 指令
        var code = '';
        var _attr$data = attr.data,
            data = _attr$data === undefined ? [] : _attr$data,
            test = attr.test,
            _attr$item = attr.item,
            item = _attr$item === undefined ? 'item' : _attr$item,
            _attr$index = attr.index,
            index = _attr$index === undefined ? 'index' : _attr$index;

        switch (tagName) {
            case 'v-for':
                // v-for 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return ' + childCode[0] + '; }, __option__)';
                } else {
                    throw new Error('v-for 标签下只能有一个标签节点');
                }
                break;
            case 'v-while':
                // v-while 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return getIf(' + test + ', function(){ return ' + childCode[0] + ';})}, __option__)';
                } else {
                    throw new Error('v-while 标签下只能有一个标签节点');
                }
                break;
            case 'v-if':
                // v-if 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    // 重置if、else条件集合
                    conditions = [];
                    code = 'getIf(' + test + ', function(){ return ' + childCode[0] + ';})';
                } else {
                    throw new Error('v-if 标签下只能有一个标签节点');
                }
                break;
            case 'v-elseif':
            case 'v-else':
                if (!prevOption || prevOption.tagName !== 'v-if' && prevOption.tagName !== 'v-elseif') {
                    throw new Error('v-elseif/else 标签下只能在v-if 或 v-elseif标签之后');
                }
                // v-elseif 标签下只能有一个标签节点
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    conditions.push(prevOption.attr.test);
                    code = 'getElseIf([' + conditions.join(',') + '], ' + (tagName === 'v-elseif' ? test : true) + ', function(){ return ' + childCode[0] + ';})';
                } else {
                    throw new Error('v-elseif/else 标签下只能有一个标签节点');
                }
                break;
            default:
                code = '';break;
        }
        return code;
    }
}

// 文本解析
function textParse(text) {
    // 匹配{ }里面内容
    var reg = /\{\s*([\(\),\w\.:\?\+\-\*\/\s'"=!<>]+)\s*\}/g;
    var originText = text;
    var result = void 0;

    while ((result = reg.exec(originText)) !== null) {
        text = text.replace(result[0], '" + (' + result[1] + ') + "');
    }

    // 拼接成："字符串" + name + "字符串";
    return '"' + text + '"';
}

function createFunction(code) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}

var Lifecycle = {
    // new Vui 后第一个执行的钩子函数
    willCreate: function willCreate() {},
    created: function created() {},
    willMount: function willMount() {},

    // 装载结束
    mounted: function mounted() {
        console.log('mounted');
    },

    // 将要更新
    willUpdate: function willUpdate() {
        console.log('willUpdate');
    },

    // 更新结束
    updated: function updated() {
        // console.log('updated');
    },

    // 将要卸载
    willUnmount: function willUnmount() {
        console.log('willUnmount');
    },

    // 卸载结束
    unmounted: function unmounted() {
        console.log('unmounted');
    }
};

function h(html) {
    return new VuiComponent((0, _parseHTML2.default)(html));
}

/**
 * @param $parent 父组件实例
 * @param config 组件配置
 * @param props 来自父组件参数
 * @param $slots 组件插槽
*/

var VuiComponent = function () {
    function VuiComponent(_ref) {
        var $parent = _ref.$parent,
            config = _ref.config,
            _ref$props = _ref.props,
            props = _ref$props === undefined ? {} : _ref$props,
            $slots = _ref.$slots;

        _classCallCheck(this, VuiComponent);

        this.cid = cid++;
        this.config = Object.assign({
            methods: {},
            data: function data() {
                return {};
            }
        }, Lifecycle, config);
        this.config.willCreate.bind(this)();
        this.componentName = this.config.name;
        this.$el = null;
        this.$parent = $parent;
        this.$slots = $slots;
        this.$children = []; // 子组件集合
        this.props = props;
        this.componentState = UNCREATED; // 组件状态
        this._data = this.config.data() || {};

        for (var funName in this.config.methods) {
            this[funName] = this.config.methods[funName];
        }

        this._init();
    }

    _createClass(VuiComponent, [{
        key: '_init',
        value: function _init() {
            var _this = this;

            this._proxyData(this._data);
            var code = createCode(this.config.ast || this.config.render(_parseHTML2.default, this));
            this.$render = createFunction(code);
            this.$vNode = this._renderVnode();

            // 将组件dom缓存起来
            componentCache[this.cid] = this;

            // 自定义组件
            new Promise(function (resolve, reject) {
                resolve();
            }).then(function () {
                if (typeof _this.config.mounted === 'function' && _this.componentState === UNCREATED) {
                    _this.componentState = CREATED;
                    _this.config.mounted.call(_this);
                }
            });
        }
    }, {
        key: '_proxyData',
        value: function _proxyData(data) {
            var _this2 = this;

            this.data = new Proxy(data, {
                get: function get(target, key, proxy) {
                    if (typeof target[key] === 'function') {
                        return target[key].bind(_this2)();
                    }

                    return target[key];
                },
                set: function set(target, key, value, proxy) {
                    throw new Error('VUI \u4E0D\u5141\u8BB8\u76F4\u63A5\u5BF9data\u8D4B\u503C\uFF0C\u5426\u5219\u53EF\u80FD\u4F1A\u5F15\u8D77\u4E00\u4E9B\u672A\u77E5\u5F02\u5E38');
                }
            });
        }
    }, {
        key: '_reRender',
        value: function _reRender() {
            // 当组件参数由render函数返回时，需每次都需要重新执行render函数
            if (typeof this.config.render === 'function') {
                var code = createCode(this.config.ast || this.config.render(_parseHTML2.default, this));
                this.$render = createFunction(code);
            }

            var $newVNode = this._renderVnode({
                update: true
            });

            var patches = (0, _VuiDiff2.default)(this.$vNode, $newVNode);

            if (patches.length) {
                // console.log(patches);
                (0, _VuiDiff.updateDom)(patches);

                if (typeof this.config.updated === 'function') {
                    this.config.updated.call(this);
                }
            }
        }
    }, {
        key: '_renderVnode',
        value: function _renderVnode() {
            var _this3 = this;

            var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var methods = {};

            Object.keys(this.config.methods).forEach(function (functionName) {
                // 绑定methods作用域
                methods[functionName] = _this3.config.methods[functionName].bind(_this3);
            });

            // 如果data中属性值是function则说明该属性为计算属性
            return this.$render.call(_extends({}, _VuiFunc2.default, {
                props: this.props,
                state: (this.$store || {}).state,
                $vuip: this
            }, this.data, methods), _extends({
                update: false
            }, option));
        }
        // 更新数据

    }, {
        key: 'setData',
        value: function setData() {
            var _this4 = this;

            var updateData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var callback = arguments[1];

            this.renderEnd = false;

            for (var key in updateData) {
                this._data[key] = updateData[key];
            }

            // renderEnd 防止在一个事件循环中多次调用setData导致重复渲染
            new Promise(function (resolve) {
                resolve();
            }).then(function () {
                if (!_this4.renderEnd) {
                    _this4._reRender();
                    _this4.renderEnd = true;
                    callback && callback();
                }
            });
        }
        // 组件卸载

    }, {
        key: 'uninstall',
        value: function uninstall() {
            var _this5 = this;

            if (this.$el.parentNode) {
                this.$el.parentNode.removeChild(this.$el);
            }
            this.config.willUnmount.call(this);
            this.config.unmounted.call(this);

            // 从$parent的$children中删除已卸载组件
            var index = null;
            this.$parent.$children.forEach(function (item, i) {
                if (item === _this5) {
                    index = i;
                }
            });
            if (index !== null) {
                this.$parent.$children.splice(index, 1);
            }

            // 子组件卸载
            this.$children.forEach(function (comp) {
                comp.uninstall();
            });
        }
    }]);

    return VuiComponent;
}();

exports.default = VuiComponent;

/***/ }),

/***/ "./src/VuiDiff.js":
/*!************************!*\
  !*** ./src/VuiDiff.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = diff;
exports.updateDom = updateDom;

var catchMap = {};

Array.prototype.replace = function (originItem, targetItem) {
    var index = null;
    this.forEach(function (item, i) {
        if (item === originItem) {
            index = i;
        }
    });

    if (isDef(index)) {
        this.splice(index, 1, targetItem);
    }

    return this;
};

function levenshteinDistance(str1, str2) {
    var num = 0;
    var len1 = str1.length;
    var len2 = str2.length;

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
        diffChildren(oldNode || [], newNode || [], patches);
    } else if (newNode === undefined) {
        patches.push({
            type: 'DELETE',
            weight: 8, // 权重，权重越大越优先更新
            oldNode: oldNode,
            point: point
        });
    } else if (oldNode.tagName === newNode.tagName) {
        if (oldNode.tagName === undefined) {
            if (oldNode.text !== newNode.text) {
                patches.push({
                    type: 'TEXT',
                    weight: 1, // 权重，权重越大越优先更新
                    oldNode: oldNode,
                    newNode: newNode
                });
            }
        } else {
            if (oldNode.tagName.indexOf('component-') === 0) {
                // 如果遇到子组件
                // props 对比
                var oldProps = oldNode.child.props;
                var newProps = newNode.child.props;
                var propsUpdate = false;

                Object.keys(oldProps).forEach(function (key) {
                    if (oldProps[key] !== newProps[key] && typeof oldProps[key] !== 'function') {
                        propsUpdate = true;
                        oldProps[key] = newProps[key];
                    }

                    // 删除 props
                    if (!Object.keys(newProps).includes(key)) {
                        propsUpdate = true;
                        delete oldProps[key];
                    }
                });

                // 如果props有变化，则子组件需要重新render
                // if (propsUpdate) {
                // }
                // 父组件更新，子组件则全部更新，
                // fix 当引入vuipx时候，state变化时并不会引起挂载到组件上面的属性的变化，但如果子组件有引用到state时就无法更新视图
                oldNode.child._reRender();

                diffChildren(oldNode.child.$slots || [], newNode.child.$slots || [], patches);
            } else {
                if (isDef(oldNode.attrs) && isDef(newNode.attrs)) {
                    // 属性对比
                    var oldAttrs = oldNode.attrs;
                    var newAttrs = newNode.attrs;
                    var attrsUpdate = false;

                    Object.keys(oldAttrs).forEach(function (key) {
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
                            newAttrs: newAttrs,
                            oldAttrs: oldAttrs
                        });
                    }
                }

                diffChildren(oldNode.children || [], newNode.children || [], patches);
            }
        }
    } else if (oldNode.tagName !== newNode.tagName) {
        patches.push({
            type: 'REPLACE',
            weight: 9, // 权重，权重越大越优先更新
            oldNode: oldNode,
            newNode: newNode,
            point: point
        });
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
        patches.push({
            type: 'ADD',
            weight: 10, // 权重，权重越大越优先更新
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
        var deleteIndex = null;
        vNode.context.$children.forEach(function (component, index) {
            if (component === vNode.child) {
                deleteIndex = index;
            }
        });

        if (deleteIndex !== null) {
            // vNode.child.config.willUnmount.call(vNode.child);
            // vNode.context.$children.splice(deleteIndex, 1);
            // vNode.child.config.unmounted.call(vNode.child);
            vNode.child.uninstall();
            // 如果有一个组件被卸载，则该组件下面的子组件会依次被卸载，无需再递归
            return;
        }
    }

    if (vNode.children && vNode.children.length) {
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

function updateDom(patches) {
    patches.forEach(function (item) {
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
            var deleteIndex = null;
            item.point.forEach(function (vd, index) {
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
            var fragment = document.createDocumentFragment();
            item.newNodes.forEach(function (vd) {
                fragment.appendChild(vd.render());
            });
            insertAfter(fragment, item.prevNode.elm);

            item.point.push.apply(item.point, item.newNodes);
        } else if (item.type === 'ATTRS') {
            item.node.updateAttrs(item.newAttrs);
        }
    });
}

/***/ }),

/***/ "./src/VuiElement.js":
/*!***************************!*\
  !*** ./src/VuiElement.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createElement = createElement;

var _VuiComponent = __webpack_require__(/*! ./VuiComponent */ "./src/VuiComponent.js");

var _VuiComponent2 = _interopRequireDefault(_VuiComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            return invokeWithErrorHandling(fns, arguments, vm);
        }
    }
    invoker.fns = fns;
    return invoker;
}

function invokeWithErrorHandling(handler, args, vm) {
    var res;
    try {
        res = args ? handler.apply(vm, args) : handler.call(vm);
    } catch (e) {
        console.error(e);
    }
    return res;
}

/**
 * 节点构造函数
 * @param tagName 标签名，组件名
 * @param option 标签属性，包括属性和事件绑定
 * @param children 标签子节点，如果是组件则是组件实例
 * @param context 标签所属组件上下文
 * */

var Element = function () {
    function Element(tagName, option, children, context) {
        _classCallCheck(this, Element);

        var _ref = option || {},
            attrs = _ref.attrs,
            on = _ref.on;

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

    _createClass(Element, [{
        key: 'render',
        value: function render(parentEl) {
            var _this = this;

            var el = null;
            if (this.tagName === undefined) {
                // 创建文本节点
                el = document.createTextNode(this.text);
                el.parentEl = parentEl;
            } else if (this.tagName === 'comment') {
                // 创建注释节点，注释节点也是一个Dom
                el = document.createComment(this.text);
            } else if (this.tagName.indexOf('component-') === 0) {
                // 渲染子组件
                if (!(this.child instanceof _VuiComponent2.default)) {
                    this.child = new _VuiComponent2.default(this.child);
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
                Object.keys(this.on).forEach(function (eventName) {
                    var cut = createFnInvoker(_this.on[eventName], _this.context);
                    el.addEventListener(eventName, cut, false);
                });
            }

            // 处理子元素
            (this.children || []).forEach(function (child) {
                if (Array.isArray(child)) {
                    // v-for、slot为数组
                    child.forEach(function (_c) {
                        // 添加子元素到当前元素
                        el.appendChild(_c.render());
                    });
                } else {
                    // 添加子元素到当前元素
                    if (_this.attrs['v-html']) {
                        // 判断是否采用html渲染，如果是，则child.length === 1
                        if (_this.children.length === 1 && child.tagName === undefined) {
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

    }, {
        key: 'updateAttrs',
        value: function updateAttrs(attrs) {
            this.attrs = attrs;
            this.setAttrs();
        }
        // 设置节点属性

    }, {
        key: 'setAttrs',
        value: function setAttrs() {
            var _this2 = this;

            // 节点属性设置
            if (this.attrs) {
                Object.keys(this.attrs).forEach(function (key) {
                    var val = undefined;
                    if (_this2.tagName === 'input' && key === 'value') {
                        _this2.elm.value = _this2.attrs[key];
                        return;
                    } else if (_this2.tagName === 'img' && key === 'src' && _this2.attrs[key] && _typeof(_this2.attrs[key]) === 'object') {
                        val = _this2.attrs[key].default;
                    } else {
                        val = _this2.attrs[key];
                    }

                    _this2.elm.setAttribute(key, val);
                });
            }
        }
    }]);

    return Element;
}();

function normalizeChildren(children) {
    var arr = [];

    children.forEach(function (item) {
        if (Array.isArray(item)) {
            if (item._isVlist) {
                item.forEach(function (vn, i) {
                    vn.key = '__vlist_' + item._index + '_' + i;
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
function createElement(tagName, option, children) {
    // 返回虚拟Dom实例
    return new Element(tagName, option, children, this.$vuip);
};

/***/ }),

/***/ "./src/VuiFunc.js":
/*!************************!*\
  !*** ./src/VuiFunc.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _VuiElement = __webpack_require__(/*! ./VuiElement */ "./src/VuiElement.js");

var _VuiComponent = __webpack_require__(/*! ./VuiComponent */ "./src/VuiComponent.js");

var _VuiComponent2 = _interopRequireDefault(_VuiComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createText(content) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}

function createSlots() {
    return this.$vuip.$slots;
}

/**
 * @param {*} componentName 组件名
 * @param {*} attr 组件属性
 * @param {*} slotNodes 组件插槽数据
 * @param {*} __option__  传递其参数
 */
function createComponent(componentName) {
    var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var slotNodes = arguments[2];
    var __option__ = arguments[3];

    // 先从局部组件中获取是否有没，没有则从全局获取
    var componentConfig = null;

    if (this.$vuip.config.component && this.$vuip.config.component[componentName]) {
        componentConfig = this.$vuip.config.component[componentName];
    } else {
        componentConfig = this.$vuip.Vuip.componentMap.get(componentName);
    }

    if (!componentConfig) {
        throw new Error('VUI \u7EC4\u4EF6\u914D\u7F6E\u4E0D\u5B58\u5728');
    }

    // 父组件传参处理
    var props = _extends({}, attr);

    var $component = null;

    // 如果是更新（即执行_reRender时候）则不创建组件，等待diff后再确认是否创建
    if (__option__.update) {
        $component = {
            $parent: this.$vuip,
            config: componentConfig,
            props: props,
            $slots: slotNodes
        };
    } else {
        $component = new _VuiComponent2.default({
            $parent: this.$vuip,
            config: componentConfig,
            props: props,
            $slots: slotNodes
        });

        this.$vuip.$children.push($component);
    }

    // 当前this指with所绑定的顶级作用域
    return _VuiElement.createElement.call(this, 'component-' + $component.config.name, null, $component);
}

/**
 * @param data 遍历数据源
 * @param callback 返回v-for标签下面的子节点
 * @param __option__ 其他参数，暂时没用
*/
function getFor(data, callback, __option__) {
    var vNodes = [];
    vNodes.push(_VuiElement.createElement.call(this, 'comment', null, 'v-for'));

    (data || []).forEach(function (item, i) {
        vNodes.push(callback(item, i));
    });

    vNodes._isVlist = true;

    return vNodes;
}

function getIf(condition, callback) {
    return !!condition ? callback() : _VuiElement.createElement.call(this, 'comment', null, condition);
}
function getElseIf(prevConditions, condition, callback) {
    // 如果之前任一条件满足，则直接返回注释
    if (prevConditions.includes(true)) {
        return _VuiElement.createElement.call(this, 'comment', null, 'else-if');
    }
    return !!condition ? callback() : _VuiElement.createElement.call(this, 'comment', null, condition);
}

exports.default = {
    createText: createText,
    createSlots: createSlots,
    createComponent: createComponent,
    getFor: getFor,
    getIf: getIf,
    getElseIf: getElseIf,
    createElement: _VuiElement.createElement
};

/***/ }),

/***/ "./src/Vuip.js":
/*!*********************!*\
  !*** ./src/Vuip.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _VuiComponent = __webpack_require__(/*! ./VuiComponent.js */ "./src/VuiComponent.js");

var _VuiComponent2 = _interopRequireDefault(_VuiComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function h(config) {
    return new _VuiComponent2.default({ config: config });
}

var Vuip = function () {
    function Vuip(option) {
        _classCallCheck(this, Vuip);

        var render = option.render,
            id = option.id,
            router = option.router,
            store = option.store;

        // 将Vui上的prototype扩展方法注入到VuiComponent实例中

        for (var key in this.__proto__) {
            _VuiComponent2.default.prototype[key] = this.__proto__[key];
        }
        _VuiComponent2.default.prototype.Vuip = Vuip;
        _VuiComponent2.default.prototype.$store = store;
        _VuiComponent2.default.prototype.$router = router;

        var $compt = render(h);
        var $app = document.querySelector(id);
        $compt.$el = $compt.$vNode.render();

        if (router) {
            router.$app = $compt;
        }
        if (router) {
            store.$app = $compt;
        }

        $app.innerHTML = '';
        $app.appendChild($compt.$el);

        return $compt;
    }

    // 插件使用


    _createClass(Vuip, null, [{
        key: 'use',
        value: function use(plugin) {
            plugin.install && plugin.install(this);
        }

        /**
         * 注册全局组件
         * @param name 组件名
         * @param option 组件配置，即.html单文件组件
         * */

    }, {
        key: 'component',
        value: function component(name, option) {
            if (name[0].toUpperCase() !== name[0]) {
                throw new Error('<' + name + '> - \u7EC4\u4EF6\u540D\u9996\u4E2A\u5B57\u6BCD\u5FC5\u987B\u5927\u5199');
            }
            if (this.componentMap.get(name)) {
                throw new Error('<' + name + '> - \u7EC4\u4EF6\u540D\u51B2\u7A81\uFF0C\u8BF7\u68C0\u67E5\u7EC4\u4EF6\u540D\u662F\u5426\u5DF2\u6CE8\u518C');
            }
            this.componentMap.set(name, option);
        }
    }]);

    return Vuip;
}();

Vuip.componentMap = new Map();

exports.default = Vuip;

/***/ }),

/***/ "./src/parseHTML.js":
/*!**************************!*\
  !*** ./src/parseHTML.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (html) {
    arr = [];
    stack = [];
    currentStack = null;
    virtualTree = null;

    parseHtml(trim(html), [parseOpenTag]);
    createVirtualTree(arr);
    return virtualTree;
};

var arr = [];
/**
* @param content 剩余内容
* @param next 下一次可能出现情况
**/
function parseHtml(content, nexts) {
    var res = null;
    for (var i = 0; i < nexts.length; i++) {
        if (typeof nexts[i] !== 'function') {
            console.error('无效参数');
        } else {
            res = nexts[i](content);

            if (res.regRes) {
                break;
            }
        }
    }

    if (!res.regRes) {
        throw new Error('\u5F53\u524D\u89E3\u6790\u672A\u5339\u914D\uFF1A' + content + '===\n');
        // return;
    }

    var _content = content.substring(res.regRes[0].length);

    if (_content.length > 0) {
        parseHtml(_content, res.nexts);
    }
}

// 开始标签
function parseOpenTag(content) {
    var reg = /^<([\w-]+)[\s\n]*>?/;
    var regRes = content.match(reg);
    var nexts = [];

    if (regRes) {
        var tagType = 1; // 1:普通标签，3:组件, 4:内置标签（遍历）

        if (regRes[1][0] === regRes[1][0].toUpperCase()) {
            tagType = 3;
        } else if (regRes[1].substring(0, 2) === 'v-') {
            tagType = 4;
        }
        arr.push({
            type: 'startTag',
            tagName: regRes[1],
            tagType: tagType // 判断是否是组件
        });

        if (regRes[0].indexOf('>') > -1) {
            nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];
        } else {
            nexts = [parseAttr, parseCloseTag];
        }
    }

    return { regRes: regRes, nexts: nexts };
}

// 开始标签结束
function parseOpenTagEnd(content) {
    var reg = /^>{1}/;
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseCloseTag, parseText, parseOpenTag];

    return { regRes: regRes, nexts: nexts };
}

// 闭合标签
function parseCloseTag(content) {
    var reg = /^<\/([\w-]+)>|^\/>{1}/;
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];

    if (regRes) {
        arr.push({
            type: 'endTag',
            tagName: regRes[1]
        });
    }

    return { regRes: regRes, nexts: nexts };
}

// 属性
function parseAttr(content) {
    var reg = /^([\w-:@]+)="([^"]*)"\s*|^([\w-:]+)\s*/;
    var regRes = content.match(reg);
    var nexts = [parseAttr, parseOpenTagEnd, parseCloseTag];

    if (regRes) {
        arr.push({
            type: 'attr',
            name: regRes[1] || regRes[3],
            value: regRes[2]
        });
    }

    return { regRes: regRes, nexts: nexts };
}

// 文本
function parseText(content) {
    var reg = /(^[^<>][^<>]*)/; // 第一个字符不是<|>,且后面字符不包含<|>
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseOpenTag, parseCloseTag];

    if (regRes && regRes[1].replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: regRes[1]
        });
    }

    return { regRes: regRes, nexts: nexts };
}

// 注释annotation
function parseAnnotation(content) {
    var reg = /(^<!\-\-[\s\S]*?\-\->)/; // 第一个字符不是<|>,且后面字符不包含<|>
    var regRes = content.match(reg);
    var nexts = [parseAnnotation, parseText, parseOpenTag, parseCloseTag];

    /*  if (regRes && regRes[1].replace(/\s/g, '') !== '') {
        arr.push({
            type: 'text',
            content: regRes[1],
        });
    } */

    return { regRes: regRes, nexts: nexts };
}

var stack = [];
var currentStack = null;
var virtualTree = null;
function createVirtualTree(sliceArr) {
    sliceArr.forEach(function (item) {
        currentStack = stack[0];

        if (!currentStack && virtualTree) {
            console.error('所有内容必须包含在一个标签内');
            return;
        }

        switch (item.type) {
            case 'startTag':
                var tagNode = {
                    type: item.tagType,
                    tagName: item.tagName,
                    attr: {}
                };

                stack.unshift(tagNode);

                if (!currentStack && !virtualTree) {
                    virtualTree = tagNode;
                } else {
                    if (!currentStack.children) {
                        currentStack.children = [];
                    }

                    currentStack.children.push(tagNode);
                }
                break;
            case 'attr':
                currentStack.attr[item.name] = item.value === undefined ? true : item.value;
                break;
            case 'text':
                if (!currentStack.children) {
                    currentStack.children = [];
                }
                currentStack.children.push({
                    type: 2,
                    content: item.content
                });
                break;
            case 'endTag':
                if (currentStack.tagName !== item.tagName && item.tagName) {
                    console.error(currentStack.tagName + '==' + item.tagName + '闭合标签错误');
                } else {
                    stack.splice(0, 1);
                }
                break;
        }
    });

    if (stack.length !== 0) {
        console.error('标签解析未完成');
    }
}

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

;

/***/ })

/******/ });