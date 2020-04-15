!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=n(2),a=s(i),l=s(n(3)),c=s(n(5));function s(e){return e&&e.__esModule?e:{default:e}}var u={},f=["onclick","onchange","onscroll"],h=0;function d(e){if(!e)throw new Error("事件绑定错误");var t=e.match(/^(\w+)\s*\(?\s*([\w,\.\s]*)\s*\)?$/);return{name:t[1],params:t[2]}}var p=[];function v(e,t){var n=e.type,r=e.content,o=e.tagName,i=e.attr,a=void 0===i?{}:i,l=e.children,c=[];(l||[]).forEach((function(e,t){c.push(v(e,t>0?l[t-1]:null))}));var s="{",u="";if(Object.keys(a).forEach((function(e,t){if(f.includes(e)){var r=d(a[e]),o=r.name,i=r.params;u+='"'+e.replace("on","")+'": function($event){ return this.'+o+"("+(/\w/.test(i)?i+",":"")+"$event)},"}else if(0===e.indexOf("v-on:")&&3===n){var l=d(a[e]),c=l.name,h=l.params;s+='"'+e.replace(/^v-on:?/,"")+'": function(a,b,c,d,e,f){ return $vuip.'+c+"("+(/\w/.test(h)?h+",":"")+"a,b,c,d,e,f)},"}else 0===e.indexOf(":")?s+='"'+e.replace(/^:?/,"")+'": '+a[e]+",":s+='"'+e+'": "'+a[e]+'",'})),s+="}",u=""!==u?"{"+u+"}":"",1===n)return"slot"===o?"createSlots()":'createElement("'+o+'", '+('{"attrs": '+s+(""!==u?', "on": '+u:"")+"}")+",["+c.join(",")+"])";if(2===n)return"createElement(undefined, null, "+function(e){var t=/\{\s*([\(\),\w\.:\?\+\-\*\/\s'"=!<>]+)\s*\}/g,n=e,r=void 0;for(;null!==(r=t.exec(n));)e=e.replace(r[0],'" + ('+r[1]+') + "');return'"'+e+'"'}(r.replace(/\r\n|\r|\n/g,""))+")";if(3===n)return'createComponent("'+o+'", '+s+",["+c.join(",")+"], __option__)";if(4===n){var h="",m=a.data,g=void 0===m?[]:m,y=a.test,w=a.item,E=void 0===w?"item":w,b=a.index,N=void 0===b?"index":b;switch(o){case"v-for":if(l&&0!==l.length){if(1!==l.length)throw new Error("v-for 标签下只能有一个标签节点");h="getFor("+g+", function("+E+","+N+"){ return "+c[0]+"; }, __option__)"}else h="";break;case"v-while":if(l&&0!==l.length){if(1!==l.length)throw new Error("v-while 标签下只能有一个标签节点");h="getFor("+g+", function("+E+","+N+"){ return getIf("+y+", function(){ return "+c[0]+";})}, __option__)"}else h="";break;case"v-if":if(l&&0!==l.length){if(1!==l.length)throw new Error("v-if 标签下只能有一个标签节点");p=[],h="getIf("+y+", function(){ return "+c[0]+";})"}else h="";break;case"v-elseif":case"v-else":if(!t||"v-if"!==t.tagName&&"v-elseif"!==t.tagName)throw new Error("v-elseif/else 标签下只能在v-if 或 v-elseif标签之后");if(l&&0!==l.length){if(1!==l.length)throw new Error("v-elseif/else 标签下只能有一个标签节点");p.push(t.attr.test),h="getElseIf(["+p.join(",")+"], "+("v-elseif"!==o||y)+", function(){ return "+c[0]+";})"}else h="";break;default:h=""}return h}}function m(e){return new Function("__option__","with(this){return "+e+"}")}var g={willCreate:function(){},created:function(){},willMount:function(){},mounted:function(){console.log("mounted")},willUpdate:function(){console.log("willUpdate")},updated:function(){},willUnmount:function(){console.log("willUnmount")},unmounted:function(){console.log("unmounted")}};var y=function(){function e(t){var n=t.$parent,r=t.config,o=t.props,i=void 0===o?{}:o,a=t.$slots;for(var l in function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.cid=h++,this.config=Object.assign({methods:{},data:function(){return{}}},g,r),this.config.willCreate.bind(this)(),this.componentName=this.config.name,this.$el=null,this.$parent=n,this.$slots=a,this.$children=[],this.props=i,this.componentState="UNCREATED",this._data=this.config.data()||{},this.config.methods)this[l]=this.config.methods[l];this._init()}return o(e,[{key:"_init",value:function(){var e=this;this._proxyData(this._data);var t=v(this.config.ast||this.config.render(c.default,this));this.$render=m(t),this.$vNode=this._renderVnode(),u[this.cid]=this,new Promise((function(e,t){e()})).then((function(){"function"==typeof e.config.mounted&&"UNCREATED"===e.componentState&&(e.componentState="CREATED",e.config.mounted.call(e))}))}},{key:"_proxyData",value:function(e){var t=this;this.data=new Proxy(e,{get:function(e,n,r){return"function"==typeof e[n]?e[n].bind(t)():e[n]},set:function(e,t,n,r){throw new Error("VUI 不允许直接对data赋值，否则可能会引起一些未知异常")}})}},{key:"_reRender",value:function(){if("function"==typeof this.config.render){var e=v(this.config.ast||this.config.render(c.default,this));this.$render=m(e)}var t=this._renderVnode({update:!0}),n=(0,a.default)(this.$vNode,t);n.length&&((0,i.updateDom)(n),"function"==typeof this.config.updated&&this.config.updated.call(this))}},{key:"_renderVnode",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n={};return Object.keys(this.config.methods).forEach((function(t){n[t]=e.config.methods[t].bind(e)})),this.$render.call(r({},l.default,{props:this.props,state:(this.$store||{}).state,$vuip:this},this.data,n),r({update:!1},t))}},{key:"setData",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments[1];for(var r in this.renderEnd=!1,t)this._data[r]=t[r];new Promise((function(e){e()})).then((function(){e.renderEnd||(e._reRender(),e.renderEnd=!0,n&&n())}))}},{key:"uninstall",value:function(){var e=this;this.$el.parentNode&&this.$el.parentNode.removeChild(this.$el),this.config.willUnmount.call(this),this.config.unmounted.call(this);var t=null;this.$parent.$children.forEach((function(n,r){n===e&&(t=r)})),null!==t&&this.$parent.$children.splice(t,1),this.$children.forEach((function(e){e.uninstall()}))}}]),e}();t.default=y},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=n(0),a=(r=i)&&r.__esModule?r:{default:r};function l(e){return new a.default({config:e})}var c=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var n=t.render,r=t.id,o=t.router,i=t.store;for(var c in this.__proto__)a.default.prototype[c]=this.__proto__[c];a.default.prototype.Vuip=e,a.default.prototype.$store=i,a.default.prototype.$router=o;var s=n(l),u=document.querySelector(r);return s.$el=s.$vNode.render(),o&&(o.$app=s),o&&(i.$app=s),u.innerHTML="",u.appendChild(s.$el),s}return o(e,null,[{key:"use",value:function(e){e.install&&e.install(this)}},{key:"component",value:function(e,t){if(e[0].toUpperCase()!==e[0])throw new Error("<"+e+"> - 组件名首个字母必须大写");if(this.componentMap.get(e))throw new Error("<"+e+"> - 组件名冲突，请检查组件名是否已注册");this.componentMap.set(e,t)}}]),e}();c.componentMap=new Map,window.Vuip=c,t.default=c},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){var n=[];return r(e,t,n),n},t.updateDom=function(e){e.forEach((function(e){if("TEXT"===e.type)e.oldNode.elm.textContent=e.newNode.text,e.oldNode.text=e.newNode.text,e.oldNode.elm.parentEl&&(e.oldNode.elm.parentEl.innerHTML=e.newNode.text);else if("DELETE"===e.type){e.oldNode.elm.parentNode.removeChild(e.oldNode.elm);var t=null;e.point.forEach((function(n,r){n===e.oldNode&&(t=r)})),e.point.splice(t,1),a(e.oldNode)}else if("REPLACE"===e.type)e.oldNode.elm.parentNode.replaceChild(e.newNode.render(),e.oldNode.elm),e.point.replace(e.oldNode,e.newNode),a(e.oldNode);else if("ADD"===e.type){var n=document.createDocumentFragment();e.newNodes.forEach((function(e){n.appendChild(e.render())})),r=n,o=e.prevNode.elm,(i=o.parentNode).lastChild==o?i.appendChild(r):i.insertBefore(r,o.nextSibling),e.point.push.apply(e.point,e.newNodes)}else"ATTRS"===e.type&&e.node.updateAttrs(e.newAttrs);var r,o,i}))};function r(e,t,n,r){if(Array.isArray(e))i(e||[],t||[],n);else if(void 0===t)n.push({type:"DELETE",weight:8,oldNode:e,point:r});else if(e.tagName===t.tagName)if(void 0===e.tagName)e.text!==t.text&&n.push({type:"TEXT",weight:1,oldNode:e,newNode:t});else if(0===e.tagName.indexOf("component-")){var a=e.child.props,l=t.child.props;Object.keys(a).forEach((function(e){a[e]!==l[e]&&"function"!=typeof a[e]&&(!0,a[e]=l[e]),Object.keys(l).includes(e)||(!0,delete a[e])})),e.child._reRender(),i(e.child.$slots||[],t.child.$slots||[],n)}else{if(o(e.attrs)&&o(t.attrs)){var c=e.attrs,s=t.attrs,u=!1;Object.keys(c).forEach((function(e){c[e]!==s[e]&&(u=!0),Object.keys(s).includes(e)||(u=!0)})),u&&n.push({type:"ATTRS",weight:2,node:e,newAttrs:s,oldAttrs:c})}i(e.children||[],t.children||[],n)}else e.tagName!==t.tagName&&n.push({type:"REPLACE",weight:9,oldNode:e,newNode:t,point:r});return n.sort((function(e,t){return e.weight>t.weight?-1:1}))}function o(e){return null!=e}function i(e,t,n){e.forEach((function(o,i){r(o,t[i],n,e)})),e.length<t.length&&n.push({type:"ADD",weight:10,prevNode:e[e.length-1],newNodes:t.slice(e.length,t.length),point:e})}function a(e){if(e.tagName&&0===e.tagName.indexOf("component-")){var t=null;if(e.context.$children.forEach((function(n,r){n===e.child&&(t=r)})),null!==t)return void e.child.uninstall()}e.children&&e.children.length&&e.children.forEach((function(e){a(e)}))}Array.prototype.replace=function(e,t){var n=null;return this.forEach((function(t,r){t===e&&(n=r)})),o(n)&&this.splice(n,1,t),this}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r,o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},i=n(4),a=n(0),l=(r=a)&&r.__esModule?r:{default:r};t.default={createText:function(e){return e},createSlots:function(){return this.$vuip.$slots},createComponent:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments[2],r=arguments[3],a=null;if(!(a=this.$vuip.config.component&&this.$vuip.config.component[e]?this.$vuip.config.component[e]:this.$vuip.Vuip.componentMap.get(e)))throw new Error("VUI 组件配置不存在");var c=o({},t),s=null;return r.update?s={$parent:this.$vuip,config:a,props:c,$slots:n}:(s=new l.default({$parent:this.$vuip,config:a,props:c,$slots:n}),this.$vuip.$children.push(s)),i.createElement.call(this,"component-"+s.config.name,null,s)},getFor:function(e,t,n){var r=[];return r.push(i.createElement.call(this,"comment",null,"v-for")),(e||[]).forEach((function(e,n){r.push(t(e,n))})),r._isVlist=!0,r},getIf:function(e,t){return e?t():i.createElement.call(this,"comment",null,e)},getElseIf:function(e,t,n){return e.includes(!0)?i.createElement.call(this,"comment",null,"else-if"):t?n():i.createElement.call(this,"comment",null,t)},createElement:i.createElement}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}();t.createElement=function(e,t,n){return new s(e,t,n,this.$vuip)};var i,a=n(0),l=(i=a)&&i.__esModule?i:{default:i};function c(e,t,n){var r;try{r=t?e.apply(n,t):e.call(n)}catch(e){console.error(e)}return r}var s=function(){function e(t,n,r,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);var i=n||{},a=i.attrs,l=i.on;this.tagName=t,this.context=o,this.text=void 0,this.children=void 0,this.on=l,this.attrs=a,void 0===t||"comment"===t?this.text=r:0===t.indexOf("component-")?this.child=r:this.children=r}return o(e,[{key:"render",value:function(e){var t=this,n=null;return void 0===this.tagName?(n=document.createTextNode(this.text)).parentEl=e:"comment"===this.tagName?n=document.createComment(this.text):0===this.tagName.indexOf("component-")?(this.child instanceof l.default||(this.child=new l.default(this.child),this.child.$parent.$children.push(this.child)),n=this.child.$vNode.render()):n=document.createElement(this.tagName),this.context.$el||(this.context.$el=n),this.elm=n,this.setAttrs(),this.on&&Object.keys(this.on).forEach((function(e){var r=function(e,t){function n(){var e=arguments,r=n.fns;if(!Array.isArray(r))return c(r,arguments,t);for(var o=r.slice(),i=0;i<o.length;i++)c(o[i],e,t)}return n.fns=e,n}(t.on[e],t.context);n.addEventListener(e,r,!1)})),(this.children||[]).forEach((function(e){if(Array.isArray(e))e.forEach((function(e){n.appendChild(e.render())}));else if(t.attrs["v-html"]){if(1!==t.children.length||void 0!==e.tagName)throw new Error("v-html 标签下只能包含一个文本标签");e.render(n),n.innerHTML=e.text}else n.appendChild(e.render())})),n}},{key:"updateAttrs",value:function(e){this.attrs=e,this.setAttrs()}},{key:"setAttrs",value:function(){var e=this;this.attrs&&Object.keys(this.attrs).forEach((function(t){var n=void 0;"input"!==e.tagName||"value"!==t?(n="img"===e.tagName&&"src"===t&&e.attrs[t]&&"object"===r(e.attrs[t])?e.attrs[t].default:e.attrs[t],e.elm.setAttribute(t,n)):e.elm.value=e.attrs[t]}))}}]),e}()},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return r=[],u=[],f=null,h=null,function e(t,n){for(var r=null,o=0;o<n.length;o++)if("function"!=typeof n[o])console.error("无效参数");else if((r=n[o](t)).regRes)break;if(!r.regRes)throw new Error("当前解析未匹配："+t+"===\n");var i=t.substring(r.regRes[0].length);i.length>0&&e(i,r.nexts)}(e.replace(/(^\s*)|(\s*$)/g,""),[o]),r.forEach((function(e){if((f=u[0])||!h)switch(e.type){case"startTag":var t={type:e.tagType,tagName:e.tagName,attr:{}};u.unshift(t),f||h?(f.children||(f.children=[]),f.children.push(t)):h=t;break;case"attr":f.attr[e.name]=void 0===e.value||e.value;break;case"text":f.children||(f.children=[]),f.children.push({type:2,content:e.content});break;case"endTag":f.tagName!==e.tagName&&e.tagName?console.error(f.tagName+"=="+e.tagName+"闭合标签错误"):u.splice(0,1)}else console.error("所有内容必须包含在一个标签内")})),0!==u.length&&console.error("标签解析未完成"),h};var r=[];function o(e){var t=e.match(/^<([\w-]+)[\s\n]*>?/),n=[];if(t){var i=1;t[1][0]===t[1][0].toUpperCase()?i=3:"v-"===t[1].substring(0,2)&&(i=4),r.push({type:"startTag",tagName:t[1],tagType:i}),n=t[0].indexOf(">")>-1?[s,a,c,o]:[l,a]}return{regRes:t,nexts:n}}function i(e){return{regRes:e.match(/^>{1}/),nexts:[s,a,c,o]}}function a(e){var t=e.match(/^<\/([\w-]+)>|^\/>{1}/),n=[s,c,o,a];return t&&r.push({type:"endTag",tagName:t[1]}),{regRes:t,nexts:n}}function l(e){var t=e.match(/^([\w-:@]+)="([^"]*)"\s*|^([\w-:]+)\s*/),n=[l,i,a];return t&&r.push({type:"attr",name:t[1]||t[3],value:t[2]}),{regRes:t,nexts:n}}function c(e){var t=e.match(/(^[^<>][^<>]*)/),n=[s,o,a];return t&&""!==t[1].replace(/\s/g,"")&&r.push({type:"text",content:t[1]}),{regRes:t,nexts:n}}function s(e){return{regRes:e.match(/(^<!\-\-[\s\S]*?\-\->)/),nexts:[s,c,o,a]}}var u=[],f=null,h=null}]);