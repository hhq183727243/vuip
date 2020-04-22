import { VElement } from './VuiElement';
interface Patche {
    type: string;
    weight: number;
    node?: VElement;
    prevNode?: VElement;
    oldNode?: VElement;
    newNode?: VElement;
    newNodes?: VElement[];
    newAttrs?: {
        [x: string]: string;
    };
    oldAttrs?: {
        [x: string]: string;
    };
    point?: VElement[] | undefined;
}
export default function diff(oldVertualDom: VElement, newVertualDom: VElement): Patche[];
export declare function updateDom(patches: Patche[]): void;
export {};
