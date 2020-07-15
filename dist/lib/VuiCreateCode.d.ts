import { AstOptions } from './interface';
/**
 * 构建创建dom代码
 * @param option 当前节点配置
 * @param prevOption 上一个节点,用来处理v-if, v-elseif, v-else指令
 * @param conditions v-if v-elseif 系列中只要之前条件满足一个，之后都不渲染
 */
declare function createCode(option: AstOptions, prevOption: AstOptions | null, conditions: string[]): string;
export default createCode;
