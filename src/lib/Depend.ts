import Watcher from './Watcher';
type WList = Array<Watcher>;

type KW = {
    [x: string]: WList
}

type KI = {
    [x: string]: Array<number>
}

// const watcherQueue = []; // watcher队列

class Depend {
    static uid: number;
    static currentWatcher: Watcher | null;
    constructor() {
        this.uid = Depend.uid++;
        this.subs = {}; // watcher实例集合
        this.subsId = {}; // watcherId集合
    }
    uid: number;
    subs: KW;
    subsId: KI;

    addSub(key: string, w: Watcher) {
        if (this.subsId[key] === undefined) {
            this.subsId[key] = [];
        }

        if (!this.subsId[key].includes(w.uid)) {
            if (this.subs[key] === undefined) {
                this.subs[key] = <WList>[]
            }

            // 添加订阅者
            this.subs[key].push(w);
            this.subsId[key].push(w.uid);
            w.addDep(key, this);
        }
    }

    notice(key: string) {
        (this.subs[key] || []).forEach((watcher: Watcher) => {
            watcher.update(key);
        });
    }
}

Depend.uid = 0;

export default Depend;