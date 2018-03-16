import path from 'path';

import express from 'express';
import pb from 'promise-breaker';
import {absolutePath as pathToSwaggerUi} from 'swagger-ui-dist';

import swaggerNodeRunner from 'swagger-node-runner';
import createSwaggerConfig from './swagger/swaggerConfig';

const PRODUCTION_HOST = 'myproductionserver.com';

async function createSwaggerMiddleware(app) {
    // Stop swaggerNodeRunner from complaining about the lack of a config file.
    process.env.SUPPRESS_NO_CONFIG_WARNING = 'true';

    // Create a swagger middleware
    const swaggerConfig = await createSwaggerConfig();
    if(process.env.NODE_ENV === 'production') {
        swaggerConfig.swagger.host = PRODUCTION_HOST;
        swaggerConfig.swagger.schemes = ['https'];
    }
    const swaggerRunner = await pb.call(done =>
        swaggerNodeRunner.create(swaggerConfig, done)
    );
    const swaggerExpress = swaggerRunner.expressMiddleware();

    // Note this line is equivalent to `app.use(swaggerExpress.middleware);`
    swaggerExpress.register(app);

    app.use((req, res, next) => {
        if(res.headersSent) {
            // Hack to get around
            // https://github.com/theganyo/swagger-node-runner/issues/87.
            // If headers have already been sent, it means swagger-node-runner
            // has written a response and called `next()` incorrectly.  Just drop
            // the request.
        } else {
            next();
        }
    });
}

export async function makeServer() {
    const app = express();

    app.use(express.static(path.resolve(__dirname, '../static')));
    app.use('/api/v1', express.static(pathToSwaggerUi()));

    await createSwaggerMiddleware(app);

    app.use('/', (req, res) => {
        res.send('Hello world');
    });

    return app;
}
