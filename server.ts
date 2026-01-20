import http from 'http';
import { app } from './app/app.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config'

const server = http.createServer(app);

const normalizePort = (val: string | number) => {
    const port = parseInt(val as string, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
};
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.3",
        info: {
            title: "ESQ Manager API",
            description: "ESQ Manager API Information",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:" + port,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Ensure we point to files that exist in runtime. 
    // For dev (ts-node), .ts files are fine if we want swagger-jsdoc to parse them.
    // For prod (dist), we likely want .js files in dist/app/routes.
    apis: ["./app/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
    console.log('Listening on ' + bind);
});

server.listen(port);
