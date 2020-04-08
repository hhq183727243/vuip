const path = require('path');
const plugins = require('./webpack.config.plugins');

module.exports = function (env = {}, argv) {
    const isProduction = !!env.production;
    const devtool = isProduction ? '' : 'cheap-module-eval-source-map';

    console.log('====================' + isProduction + '====================');

    return {
        // JavaScript 执行入口文件
        devtool,

        // 配合devServer使用，当文件修改时通知 webpack-dev-server模块更新页面
        /* watch: true, //文件监听，原理是根据文件最后保存时间来判断是否有更新
        watchOptions: {
            ignored: /node_modules/, // 忽略node_modules下文件
            aggregateTimeout: 500, // 文件更新后等待1000ms 后只执行更新通知
            poll: 2, // 每秒监听几次
        }, */

        entry: {
            vuip: path.resolve(__dirname, '../src/Vuip.js'),
        },
        mode: 'development',
        output: {
            // 把所有依赖的模块合并输出到一个 bundle.js 文件
            filename: '[name].js?id=[hash:8]',
            // 输出文件都放到 dist 目录下
            //path: path.resolve(__dirname, './dist'),
            path: path.resolve(__dirname, '../dist'),
            // publicPath: 'http://cnd.com/',
            chunkFilename: "[id].chunk.js" // 非入口文件命名规则
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: "babel-loader"
                }
            ]
        },
        plugins: plugins(isProduction),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src/'),
            }
        }
    }
};