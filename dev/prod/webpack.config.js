//
// Copyright © 2020 Anticrm Platform Contributors.
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Dotenv = require('dotenv-webpack')
const path = require('path')

const mode = process.env.NODE_ENV || 'development'
const prod = mode === 'production'

module.exports = {
	entry: {
		bundle: ['./src/main.ts']
	},
	resolve: {
		symlinks: true,
		alias: {
			svelte: path.resolve('../../node_modules', 'svelte')
		},
		extensions: ['.mjs', '.js', '.svelte', '.ts'],
		mainFields: ['svelte', 'browser', 'module', 'main']
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name].js',
		chunkFilename: '[name].[id].js',
		publicPath: '/'
	},
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						emitCss: true,
						hotReload: true,
						preprocess: require('svelte-preprocess')({
							babel: {
								presets: [
									[
										'@babel/preset-env',
										{
											loose: true,
											modules: false,
											targets: {
												esmodules: true,
											},
										},
									],
									"@babel/typescript"
								],
								plugins: ["@babel/plugin-proposal-optional-chaining"],
							},
						})
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					/**
					* MiniCssExtractPlugin doesn't support HMR.
					* For developing, use 'style-loader' instead.
					* */
					prod ? MiniCssExtractPlugin.loader : 'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(ttf|otf|eot|woff|woff2)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "fonts/[name].[ext]",
						esModule: false
					},
				},
			},
			{
				test: /\.(jpg)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "img/[name].[ext]",
						esModule: false
					},
				},
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							esModule: false
						}
					},
					{
						loader: 'svgo-loader',
						options: {
							plugins: [
								{ removeHiddenElems: { displayNone: false } },
								{ cleanupIDs: false },
								{ removeTitle: true },
							]
						}
					}
				]
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new Dotenv()
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		publicPath: '/',
		historyApiFallback: {
			disableDotRule: true
		}
	},
}
