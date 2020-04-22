const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
    new DefinePlugin({
        //设置打包环境，在业务代码中可以通过 process.env.NODE_ENV === 'production' 去判断是否为生产环境还是开发环境
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    }),
    new CleanWebpackPlugin({
        root: path.resolve(__dirname, '../'), //根目录
        verbose: true, //是否启用控制台输出信息
        dry: false //设置为false,启用删除文件
    }),
    new CopyWebpackPlugin([
        {
            from: path.resolve(__dirname + '/../public'),
            to: path.resolve(__dirname + '/../dist'),
            ignore: ['*.jpg']
        }
    ])
]