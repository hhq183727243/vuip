// 是否是{ }对象
export function isObject(val: any): boolean {
    if (!val) {
        return false;
    }
    return Object.prototype.toString.call(val) === '[object Object]';
}

// 告警
export function warn(content: string): void {
    console.warn(content);
}

// 告警
export function isUnd(val: any): boolean {
    return val === undefined;
}

// 是否函数
export function isFunc(val: any): boolean {
    return typeof val === 'function';
}

// 是否数组
export function isArray(val: any): boolean {
    return Array.isArray(val);
}
