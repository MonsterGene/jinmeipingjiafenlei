const path = require("path")
const HTMLPlugin = require("html-webpack-plugin")
const webpack = require("webpack")
const ExtractPlugin = require("extract-text-webpack-plugin")
const uglifyjs = require('uglifyjs-webpack-plugin');

const isDev = process.env.NODE_ENV === "development"

const config = {
    target: "web",
    entry: path.join(__dirname, "src/index.js"),
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [{
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.jsx$/,
                loader: "babel-loader"
            },
            {
                test: /\.(gif|jpg|jpeg|png|svg|ttf|woff)$/,
                use: [{
                    loader: "url-loader",
                    options: {
                        limit: 1200,
                        name: "[name]-static.[ext]"
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }),
        new HTMLPlugin()
    ]
}

if (isDev) {
    config.module.rules.push({
        test: /\.styl/,
        use: [
            "style-loader",
            "css-loader",
            {
                loader: "postcss-loader",
                options: {
                    sourceMap: true
                }
            },
            "stylus-loader"
        ]
    })
    config.module.rules.push({
        test: /\.css$/,
        use: [
            "style-loader",
            {
                loader: "css-loader",
                options: {
                    minimize: true
                }
            }
        ]
    })
    config.devtool = "#cheap-module-eval-source-map" //帮助调试代码
    config.devServer = {
        port: "8030",
        host: "127.0.0.1",
        overlay: {
            errors: true //错误显示到网页上面
        },
        open: false, //是否自动打开浏览器
        historyApiFallback: true, //单页应用中将未映射的路由。。。
        hot: true, //重新渲染组件，而不是刷新整个界面
    }
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue', 'jquery', "iview"],
    }
    config.output.filename = '[name].[chunkhash:8].js'
    config.module.rules.push({
        test: /\.styl/,
        use: ExtractPlugin.extract({
            fallback: 'style-loader',
            use: [{
                    loader: "css-loader",
                    options: {
                        minimize: true
                    }
                },
                {
                    loader: "postcss-loader",
                    options: {
                        sourceMap: true
                    }
                },
                'stylus-loader'
            ]
        })
    })
    config.module.rules.push({
        test: /\.css$/,
        use: ExtractPlugin.extract({
            fallback: "style-loader",
            use: [{
                loader: "css-loader",
                options: {
                    minimize: true
                }
            }]
        })
    })
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'
        }),
        new uglifyjs() //压缩js
    )
}

module.exports = config