const path = require('path');
const plugins = require('./webpack.config.plugins');

module.exports = function (env = {}, argv) {
    return {
        entry: {
            vuip: path.resolve(__dirname, '../src/Vuip.ts'),
        },
        mode: 'production',
        output: {
            // 把所有依赖的模块合并输出到一个 bundle.js 文件
            filename: '[name].min.js',
            // 输出文件都放到 dist 目录下
            // path: path.resolve(__dirname, '../../vuip-template/node_modules/vuip/dist'),
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
                }, {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true // 是否只编译，true只编译不检测，false编译检测
                    }
                }
            ]
        },
        plugins: plugins,
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, './src/'),
            }
        }
    }
};