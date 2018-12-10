const webpack = require('webpack');
const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const resolve = function(dir) {
    return path.join(__dirname, dir);
}
var hash = new Date().getTime();
var evn = process.env.NODE_ENV;
var config = function(evn) {
    var _config = {
        entry: {
            main: resolve('./src/main.js'),
            setshare: resolve('./src/setshare.js'),
            list: resolve('./src/list.js'),
            mine: resolve('./src/mine.js'),
            home: resolve('./src/home.js'),
            dltip: resolve('./src/dltip.js'),
            myworks: resolve('./src/mywork.js')
        },
        output: {
            filename: './js/[name].[hash:7].js',
            path: resolve('/dist'),
        },
        externals: {
            jquery: 'jQuery'
        },
        module: {
            loaders: [{
                test: '/\.js$/',
                loader: 'babel-loader',
                include: [resolve('./src')]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function() {
                                return [require('autoprefixer')]
                            }
                        }
                    }]
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.tpl$/,
                loader: 'ejs-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|eot|woff|ttf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: './img/[name].[hash:7].[ext]'
                }
            }]
        },
        plugins: [
            new ExtractTextPlugin('./css/[name].[contenthash].css'),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/wonxVideo.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:""
                },                
                chunks:['main']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/postierSetShare.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"配置分享内容"
                },
                chunks:['setshare']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/postierList.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"选择视频模版"
                },               
                chunks:['list']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/postierMine.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"我的"
                },
                chunks:['mine']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/home.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"微动海报"
                },
                chunks:['home']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/dltips.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"下载提示"
                },
                chunks:['dltip']
            }),
            new HtmlWebpackPlugin({
                filename: resolve('./dist/myworks.html'),
                template: './index.html',
                inject: true,
                data:{
                    title:"我的作品"
                },
                chunks:['myworks']
            })
        ]
    };

    if (process.env.EXE_ENV == "run:dev") {

        _config.devtool = 'nosources-source-map'  ;  
        _config.plugins.push(new webpack.HotModuleReplacementPlugin());
        _config.plugins.push(new webpack.DefinePlugin({
            'process.eve.EXE_ENV': "'run:dev'"
        }));
    } else {
        _config.plugins.unshift(new webpack.optimize.UglifyJsPlugin({
            compress: false,
            warnings: false
        }));
        _config.plugins.push(new FriendlyErrorsPlugin());
        _config.devtool = 'inline-source-map';
    }
    return _config;
}
module.exports = config(evn);