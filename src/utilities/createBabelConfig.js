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
        // babelConfig.presets.unshift(require.resolve('babel-preset-es2015'));
        babelConfig.presets.unshift({
            plugins: [
                require('babel-plugin-transform-es2015-template-literals'),
                require('babel-plugin-transform-es2015-literals'),
                require('babel-plugin-transform-es2015-function-name'),
                require('babel-plugin-transform-es2015-arrow-functions'),
                require('babel-plugin-transform-es2015-block-scoped-functions'),
                [
                    require('babel-plugin-transform-es2015-classes'),
                    {
                        loose: true
                    }
                ],
                require('babel-plugin-transform-es2015-object-super'),
                require('babel-plugin-transform-es2015-shorthand-properties'),
                require('babel-plugin-transform-es2015-computed-properties'),
                require('babel-plugin-transform-es2015-for-of'),
                require('babel-plugin-transform-es2015-sticky-regex'),
                require('babel-plugin-transform-es2015-unicode-regex'),
                require('babel-plugin-check-es2015-constants'),
                require('babel-plugin-transform-es2015-spread'),
                require('babel-plugin-transform-es2015-parameters'),
                require('babel-plugin-transform-es2015-destructuring'),
                require('babel-plugin-transform-es2015-block-scoping'),
                require('babel-plugin-transform-es2015-typeof-symbol'),
                require('babel-plugin-transform-es2015-modules-commonjs'),
                [
                    require('babel-plugin-transform-regenerator'),
                    {
                        async: false,
                        asyncGenerators: false
                    }
                ]
            ]
        });

        babelConfig.plugins.push(require.resolve('babel-plugin-transform-proto-to-assign'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-object-set-prototype-of-to-assign'));
    } else {
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-modules-commonjs'));
        babelConfig.plugins.push(require.resolve('babel-plugin-transform-es2015-parameters'));
    }

    return babelConfig;
};
