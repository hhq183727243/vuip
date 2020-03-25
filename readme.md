vuihtml
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
<!-- 有序列表
1. 项目1
2. 项目2
3. 项目3
   * 项目1
   * 项目2
3 其它
图片
![图片名称](http://upload-images.jianshu.io/upload_images/1097226-6a6fbea43e82e7ac.png)
链接
[链接名称](http://gitcafe.com)
引用
> 第一行引用文字
> 第二行引用文字
水平线
***
代码
`<hello world>`
代码块高亮
```ruby
  def add(a, b)
    return a + b
  end -->