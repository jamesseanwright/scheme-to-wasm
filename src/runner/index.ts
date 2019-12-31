import * as http from 'http';
import * as url from 'url';
import * as assert from 'assert';
import * as fs from 'fs';
import getHtml from './html';

function assertEntry(entry?: string): asserts entry is string {
  assert.ok(entry, 'WASM entry point is not defined!');
}

const [, , ENTRY] = process.argv;
const PORT = 9009;

assertEntry(ENTRY);

const html = getHtml(ENTRY);

const serveHtml = (res: http.ServerResponse, markup: string) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });

  res.end(markup);
};

const serveWasm = (res: http.ServerResponse, filename: string) => {
  const wasm = fs.createReadStream(filename);

  res.writeHead(200, {
    'Content-Type': 'application/wasm',
  });

  wasm.pipe(res);
};

const serveNotFound = (res: http.ServerResponse) => {
  res.writeHead(404, {
    'Content-Type': 'text/plain',
  });

  res.end('Not found');
};

const server = http.createServer((req, res) => {
  switch (url.parse(req.url || '').pathname) {
    case '/':
      serveHtml(res, html);
      break;

    case `/${ENTRY}`:
      serveWasm(res, ENTRY);
      break;

    default:
      serveNotFound(res);
  }
});

server.listen(PORT, () => {
  console.log(`🌍  Serving application on port ${PORT}...`);
});
