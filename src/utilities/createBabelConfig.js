import path from 'path';

export default (config) => {
    let babelConfig;

    babelConfig = {
        babelrc: false,
        extends: path.resolve(__dirname, './../babelrc.json'),
        plugins: [
            [
                require.resolve('babel-plugin-lodash-modularize'),
                {
                    lodashVersion: '4.0.0'
                }
            ],
            require.resolve('babel-plugin-add-module-exports')
        ],
        presets: [
            require.resolve('babel-preset-stage-0'),
            require.resolve('babel-preset-react')
        ]
    };

    if (config.typeAssertions) {
        babelConfig.plugins.unshift(require.resolve('babel-plugin-typecheck'));
    }

    if (config.es5) {
        babelConfig.presets.unshift(require.resolve('babel-preset-es2015'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-proto-to-assign'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-object-set-prototype-of-to-assign'));
        babelConfig.plugins.push([require.resolve('babel-plugin-transform-es2015-classes'), { "loose": true }]);
    } else {
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-modules-commonjs'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-parameters'));
    }

    return babelConfig;
};
