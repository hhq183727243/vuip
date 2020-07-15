// 是否是{ }对象
export function isObject(val: any): boolean {
    if (!val) {
        return false;
    }
    return Object.prototype.toString.call(val) === '[object Object]';
}

// 是否数字
export function isNumber(val: any): boolean {
    return typeof val === 'number';
}

// 是否字符串
export function isString(val: any): boolean {
    return typeof val === 'string';
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


// 是否是基本类型数据
export function isBase(val: any): boolean {
    return (
        typeof val === 'boolean' ||
        typeof val === 'number' ||
        typeof val === 'string'
    );
}
