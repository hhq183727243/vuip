import Watcher from './Watcher';
declare type WList = Array<Watcher>;
declare type KW = {
    [x: string]: WList;
};
declare type KI = {
    [x: string]: Array<number>;
};
declare class Depend {
    static uid: number;
    static currentWatcher: Watcher | null;
    constructor();
    uid: number;
    subs: KW;
    subsId: KI;
    addSub(key: string, w: Watcher): void;
    notice(key: string): void;
}
export default Depend;
