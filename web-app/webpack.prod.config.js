const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CompressionPlugin = require("compression-webpack-plugin");
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
    watch: false,
    mode: 'production',
    entry: './src/app.js',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, 'css-loader'
                ]
            },
        ]
    },
    output: {
        path: path.resolve(__dirname + '/public/', 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'main.css'
        }),
        new CompressionPlugin({
            test: /\.js(\?.*)?$/i,
        }),
        new WebpackObfuscator({
            rotateStringArray: true
        }),
    ]
};