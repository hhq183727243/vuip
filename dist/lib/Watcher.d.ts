import VuiComponent from "./VuiComponent";
import Depend from "./Depend";
declare type KDep = {
    [x: string]: Depend;
};
declare class Watcher {
    static uid: number;
    constructor(vm: VuiComponent, expOrFn: string | Function, renderWatcher?: boolean);
    vm: VuiComponent;
    value: any;
    uid: number;
    updating: boolean;
    getter: Function;
    depsMap: Map<number, KDep>;
    newDepsMap: Map<number, KDep>;
    addDep(key: string, dep: Depend): void;
    depend(): void;
    get(): any;
    clearDep(): void;
    update(key: string): void;
}
export default Watcher;
