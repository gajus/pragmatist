import notifier from 'node-notifier';
// import stackTrace from 'stack-trace';
import log from 'fancy-log';
import prettyjson from 'prettyjson';

export default (config) => {
    let errorHandler;

    errorHandler = function (error) {
        let errorPrint;

        errorPrint = error;

        if (error.message) {
            // console.log('error', error.stack);

            if (config.notifications) {
                notifier.notify({
                    message: error.message,
                    title: error.name
                });
            }

            errorPrint = {
                message: error.message,
                name: error.name,
                plugin: error.plugin
            };

            /* stack: _.map(stackTrace.parse(error), (crumb) => {
                return crumb.fileName + ':' + crumb.lineNumber + ':' + crumb.columnNumber;
            }) */

            /* eslint-disable no-underscore-dangle */
            if (error._babel && error.codeFrame) {
            /* eslint-enable no-underscore-dangle */
                errorPrint.code = {
                    file: error.fileName + ':' + error.loc.line + ':' + error.loc.column,
                    frame: error.codeFrame
                };

                if (errorPrint.message.indexOf(error.fileName + ': ') === 0) {
                    errorPrint.message = errorPrint.message.substr(error.fileName.length + 2);
                }
            }
        }

        log('\n\n' + prettyjson.render(errorPrint) + '\n');

        this.emit('end');
    };

    return {
        errorHandler
    };
};
