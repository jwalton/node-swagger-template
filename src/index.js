/* eslint "no-console": off */
import express from 'express';

export const app = express();

function startServer() {
    const port = process.env.PORT || 10010;

    app.use('/', (req, res) => {
        res.send('Hello world');
    });

    app.listen(port);
    console.log(`Listening on port ${port}`);
}

startServer();
