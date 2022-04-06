const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    watch: true,
    mode: 'development',
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
    devtool: 'eval-source-map',
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'main.css'
        }),
        new CompressionPlugin({
            test: /\.js(\?.*)?$/i,
        }),
    ]
};