import { createReadStream } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import contentDisposition from 'content-disposition';
import Fastify from 'fastify';
import fastifyCompress from '@fastify/compress';
import fastifyStatic from '@fastify/static';

const fastify = Fastify();

await fastify.register(fastifyCompress);
await fastify.register(fastifyStatic, {
  root: dirname(fileURLToPath(import.meta.url)),
});

fastify.get('/', (_request, reply) => {
  reply.type('text/html').send('<a href="/image.jpeg">Download</a>');
});

fastify.get('/image.jpeg', (_request, reply) => {
  const filename = './oslo_ast_2000239_lrg.jpeg';
  reply
    .header('content-disposition', contentDisposition(filename))
    .compress(createReadStream(filename));
});

fastify.setErrorHandler((error, _request, reply) => {
  console.error(error);

  reply.status(500).send();
});

await fastify.listen({ port: 8081 });

console.log('Open http://localhost:8081');
