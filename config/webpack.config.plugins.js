const path = require('path');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");//提取css到单独文件的插件
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (isProduction) {
    const plugins = [
        // new MiniCssExtractPlugin({
        //     filename: "css/[name]_[chunkhash:8].css", //都提到build目录下的css目录中
        //     chunkFilename: "[id].css"
        // }),
        // new OptimizeCssAssetsPlugin(),
        new DefinePlugin({
            //设置打包环境，在业务代码中可以通过 process.env.NODE_ENV === 'production' 去判断是否为生产环境还是开发环境
            'process.env': {
                NODE_ENV: JSON.stringify(isProduction ? 'production' : 'develop')
            }
        }),
        new CopyWebpackPlugin([
            {
                from: __dirname + '../public',
                to: __dirname + '../dist',
                ignore: ['*.jpg']
            }
        ])
    ]

    if (isProduction) {
        // 删除的目录为 output.path
        plugins.push(new CleanWebpackPlugin({
            root: path.resolve(__dirname, '../'), //根目录
            verbose: true, //是否启用控制台输出信息
            dry: false //设置为false,启用删除文件
        }));
    }
    return plugins;
}