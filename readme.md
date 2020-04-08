vuip
# 参考vue实现一个自己的前端框架
一直不明白vue的单文件组件为什么要以.vue结尾，做成.js 或 .html 不行吗？ 基于这个疑问，我决定我的单文件组件就要.html结尾,所以框架名就交vuihtml。对刚入门同学来说是不是更友好点，一个.html文件就是一个组件，而且在.html里面下写html标签也显得跟加合理

## 实现功能
* { name + 1 + 2 + (sex === 1 ? '男' : '女') } 字符串模板表达式
* v-for 列表渲染
* v-if 条件判断
* v-html html直接渲染
* slot 插槽
* component 组件定制复用
* 基础生命周期

## 扩展功能
* 引入vuip-router 路由可实现SPA
* 引入vuipx 可实现全局状态管理