/**
 * @author chenlin
 * @date 2019/10/10
 * @version:v1.1.0
 */

const { override, fixBabelImports, addLessLoader ,addBabelPlugins } = require('customize-cra');
const theme = require("./src/theme/theme");

module.exports = override(
    ...addBabelPlugins( // 支持装饰器
        [
            '@babel/plugin-proposal-decorators',
            { legacy: true}
        ]
    ),
    addLessLoader({
        javascriptEnabled: true,
        modifyVars: theme.ThemeConfig,
    }),
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
    }),
);
