import * as path from 'path';

const config = {
    // When running tests, we use `babel-register` so we can run tests directly from
    // the source files without having to build first.  In production, there's
    // no `babel-register`, so we need to run from a different folder depending
    // on whether this is a test or not.  We accomplish this by lying to
    // swagger-node-runner about `appRoot`, pointing appRoot to the src folder
    // or the lib folder, depending on where we're running from.
    appRoot: path.resolve(__dirname, '..'),
    // Note that swagger-node-runner does *not* use `appRoot` to resolve your
    // swagger.yaml file.  If you provide a relative path here, this will be
    // resolved relative to the CWD.
    swagger: path.resolve(__dirname, '../../api/swagger/swagger.yaml'),
    fittingsDirs: [`swagger/fittings`],
    defaultPipe: null,
    swaggerControllerPipe: 'swagger_controllers',
    bagpipes: {
        _router: {
            name: 'swagger_router',
            mockMode: false,
            mockControllersDirs: [`swagger/mocks`],
            controllersDirs: [`swagger/controllers`]
        },
        _swagger_validate: {
            name: 'swagger_validator',
            'validateResponse': true
        },
        swagger_controllers: [
            {onError: 'json_error_handler'},
            'cors',
            'swagger_params_parser',
            'custom_validators', // Custom fitting, found in /src/swagger/fittings/custom_validators.js
            'swagger_security',
            '_swagger_validate',
            'express_compatibility',
            '_router'
        ],
        swagger_raw: {
            name: 'swagger_raw'
        }
    }
};

export default config;
