"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Require the framework and instantiate it
const fastify_1 = __importDefault(require("fastify"));
// import { Server, IncomingMessage, ServerResponse } from 'http'
const server = (0, fastify_1.default)({});
const opts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    pong: {
                        type: 'string'
                    }
                }
            }
        }
    }
};
// Declare a route
server.get('/', async (request, reply) => {
    return { hello: 'world' };
});
server.get('/ping', opts, async (request, reply) => {
    return { pong: 'it worked!' };
});
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
