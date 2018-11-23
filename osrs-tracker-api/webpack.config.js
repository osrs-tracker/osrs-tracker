'use strict';

const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');


module.exports = env => {
    const config = {
        entry: ['./src/main.ts'],
        mode: env.mode,
        target: 'node',
        node: {
            __dirname: false,
            __filename: false,
        },
        output: {
            filename: 'osrs-tracker-api.js',
            path: path.resolve(__dirname, 'dist'),
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['node_modules', 'src']
        },
        stats: {
            colors: true,
            modules: false,
            warningsFilter: /^(?!CriticalDependenciesWarning$)/
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        keep_fnames: true
                    }
                })
            ]
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(['./dist']),
            new webpack.DefinePlugin({
                VERSION: JSON.stringify(require('./package.json').version),
                DEVELOP: env.mode === 'development'
            }),
            new webpack.NormalModuleReplacementPlugin(/config.ts/, env.mode === 'production' ? 'config.ts' : 'config.hidden.ts')
        ],
    };

    if (env.visualise) config.plugins.push(new Visualizer());

    return config;
};
