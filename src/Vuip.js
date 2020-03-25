import VuiComponent from './VuiComponent.js';


class Vui extends VuiComponent {
    constructor({ id, config }) {
        super({ config });
        this.$app = document.querySelector(id);
        this.$el = this.$vNode.render();
        this.$app.innerHTML = '';
        this.$app.appendChild(this.$el);

        // 将Vui上的prototype扩展方法注入到VuiComponent实例中
        for (let key in this.__proto__) {
            VuiComponent.prototype[key] = this.__proto__[key]
        }
    }
}

export default Vui; 