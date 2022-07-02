// Require the framework and instantiate it
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
// import { Server, IncomingMessage, ServerResponse } from 'http'

const server: FastifyInstance = Fastify({})

const opts: RouteShorthandOptions = {
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
}

// Declare a route
server.get('/', async (request, reply) => {
  return { hello: 'world' }
})

server.get('/ping', opts, async (request, reply) => {
  return { pong: 'it worked!' }
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})