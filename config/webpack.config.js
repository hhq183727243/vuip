const path = require('path');
const plugins = require('./webpack.config.plugins');

module.exports = function (env = {}, argv) {
    return {
        entry: {
            vuip: path.resolve(__dirname, '../src/Vuip.js'),
        },
        mode: 'production',
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
        plugins: plugins,
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src/'),
            }
        }
    }
};