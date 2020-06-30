import Depend from './Depend';
import Watcher from './Watcher';
import VuiComponent from './VuiComponent';
import { AnyObj } from './interface';
import { isObject, isFunc } from './uitls';

// 代理对象
export default function proxyObj(obj: AnyObj) {
    if (!isObject(obj) || obj.__isProxy__) {
        return obj;
    }

    const dep = new Depend();

    const _proxy = new Proxy(obj, {
        get: (target: AnyObj, key: string, proxy: AnyObj) => {
            if (key === '__isProxy__') {
                return true;
            }

            if (
                typeof key !== 'symbol'
                && Depend.currentWatcher
                && !isFunc(target[key]) // 不为函数收集依赖
                && !(target[key] instanceof VuiComponent) // 不为vm实例收集依赖
            ) {
                dep.addSub(key, Depend.currentWatcher);
            }

            // 计算属性
            if (target[key] instanceof Watcher) {
                // 从哨兵中取值时，那么当面currentWatcher也依赖于这个哨兵所观察的所有对象
                if (Depend.currentWatcher) {
                    target[key].depend();
                }

                return target[key].value;
            }

            return target[key];
        },
        set: (target: AnyObj, key: string, value: any, receiver: any): boolean => {
            // throw new Error(`VUI 不允许直接对data赋值，否则可能会引起一些未知异常`);
            if (typeof value === 'object' && !(value instanceof Watcher)) {
                target[key] = proxyObj(value);
            } else {
                target[key] = value;
            }

            dep.notice(key);

            return true;
        }
    });

    for (let key in obj) {
        if (
            !(obj[key] instanceof VuiComponent) &&
            !(obj[key] instanceof Watcher)
        ) {
            obj[key] = proxyObj(obj[key]);
        }
    }

    return _proxy;
}