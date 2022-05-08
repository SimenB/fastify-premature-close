import { createReadStream } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import contentDisposition from 'content-disposition';
import Fastify from 'fastify';
import fastifyCompress from 'fastify-compress';
import fastifyStatic from 'fastify-static';
import http from 'http';
import { pipeline } from 'stream/promises';

const fastify = Fastify();

fastify.register(fastifyCompress);
fastify.register(fastifyStatic, {
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
    // .send(createReadStream(filename));
});

fastify.setErrorHandler((error, _request, reply) => {
  console.error(error);

  reply.status(500).send();
});

const serverUrl = await fastify.listen(8081);

// console.log('Open http://localhost:8081');

const consume = async (res) => {
  const chunks = []
  for await (const chunk of res) {
    console.log({ resChunkLength: chunk.toString().length })
    chunks.push(chunk.toString())
  }

  const payload = chunks.join('')
  console.log({ payloadLength: payload.length })
  return chunks
}

const req = http.get(`${serverUrl}/image.jpeg`)
req.on('response', async res => {
  setTimeout(() => res.destroy(), 40)
  await pipeline(res, consume)
  fastify.close()
})
