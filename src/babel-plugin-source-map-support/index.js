import 'source-map-support/register';

/*
 * return the AST for this statement:
 *
 *     _sourceMapSupportRegister.install({ handleUncaughtException: true })
 */
function handleUncaughtExceptionNode(t, id) {
    return t.expressionStatement(
        t.callExpression(
            t.memberExpression(
                id,
                t.identifier('install')
            ), [
                t.objectExpression([
                    t.property(
                        'init',
                        t.identifier('handleUncaughtException'),
                        t.literal(true)
                    )
                ])
            ]
        )
    );
}

export default ({types: t}) => {
    return {
        visitor: {
            Program (path, {file}) {
                let id;

                id = file.addImport(
                    require.resolve('source-map-support/register'),
                    null,
                    'absolute'
                );
            }
        }
    };
};
