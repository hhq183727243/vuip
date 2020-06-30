import VuiComponent from "./VuiComponent";
import Depend from "./Depend";
import { AnyObj } from "./interface";
declare class Watcher {
    static uid: number;
    constructor(vm: VuiComponent, expOrFn: string | Function, renderWatcher?: boolean);
    vm: VuiComponent;
    value: any;
    uid: number;
    updating: boolean;
    getter: Function;
    depsMap: AnyObj;
    addDep(key: string, dep: Depend): void;
    depend(): void;
    get(): any;
    update(key: string): void;
}
export default Watcher;
