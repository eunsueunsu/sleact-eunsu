import path from 'path';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const isDevelopment = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
    name: 'sleact',
    mode: isDevelopment ? 'development' : 'production',
    devtool: !isDevelopment ? 'hidden-source-map' : 'eval',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],  //    바벨이 처리할 확장자 목록
        alias: {
            '@hooks': path.resolve(__dirname, 'hooks'),  // 패스 설정 [tsconfig , webpackconfig 모두 설정필요(중복)]
            '@components': path.resolve(__dirname, 'components'),
            '@layouts': path.resolve(__dirname, 'layouts'),
            '@pages': path.resolve(__dirname, 'pages'),
            '@utils': path.resolve(__dirname, 'utils'),
            '@typings': path.resolve(__dirname, 'typings'),
        },
    },
    entry: {
        app: './client',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,   // tsx 파일을
                loader: 'babel-loader',  // 바벨로더가 바꿔준다 아래 정의된 브라우저에 지원하게끔 , 최신문법으로 코딩해서 어느 브라우저에서 호환되도록 바꿔줌
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: { browsers: ['last 2 chrome versions'] },
                                debug: isDevelopment,
                            },
                        ],
                        '@babel/preset-react',
                        '@babel/preset-typescript',
                    ],
                    env: {
                        development: {
                            plugins: [['@emotion', { sourceMap: true }], require.resolve('react-refresh/babel')],
                        },
                        production: {
                            plugins: ['@emotion'],
                        },
                    },
                },
                exclude: path.join(__dirname, 'node_modules'),
            },
            {
                test: /\.css?$/,
                use: ['style-loader', 'css-loader'],   // 바벨의 스타일로더, css로더가 js 결과물로 변환해준다
            },
        ],
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({
            async: false,
            // eslint: {
            //   files: "./src/**/*",
            // },
        }),
        new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }),  // environmentplugin은 리액트에서 node_env를 접근할 수 있게 해줌 node_env는 본래 백엔드에서 사용
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js', // entry의 app name
        publicPath: '/dist/',
    },
    devServer: {
        historyApiFallback: true, // react router
        port: 3090,
        publicPath: '/dist/',
        proxy: {
            '/api/': {
                target: 'http://localhost:3095',
                changeOrigin: true,
            },
        },
    },
};

if (isDevelopment && config.plugins) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new ReactRefreshWebpackPlugin());
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
}
if (!isDevelopment && config.plugins) {
    config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

export default config;
