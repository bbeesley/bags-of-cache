import { readFile } from 'node:fs/promises';
import * as url from 'node:url';
import path from 'node:path';
import test from 'ava';
import delay from 'delay';
import sinon from 'sinon';
import { CacheingClient } from './cacheing-client.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const dependencies = [];

test.before(async () => {
  const fileContent = await readFile(
    path.resolve(__dirname, '../package-lock.json'),
    {
      encoding: 'utf8',
    },
  );
  dependencies.push(JSON.parse(fileContent));
});

test('get -> returns an item that was just set', (t) => {
  const client = new CacheingClient({ ttl: 500 });
  const fooValue = 'foo';
  client.set('foo', fooValue);
  t.is(client.get('foo'), fooValue);
});

test('get -> does not return an item when the cache is stopped', (t) => {
  const client = new CacheingClient({ ttl: 500 });
  const fooValue = 'foo';
  client.set('foo', fooValue);
  client.stop();
  t.is(client.get('foo'), undefined);
});

test('get -> does not return an item that was set beyond the ttl', async (t) => {
  const client = new CacheingClient({ ttl: 50 });
  const fooValue = 'foo';
  client.set('foo', fooValue);
  await delay(50);
  t.is(client.get('foo'), undefined);
});

test('get -> cached items are not mutated', (t) => {
  const client = new CacheingClient({ ttl: 500 });
  const fooValue = ['foo', 'bar'];
  client.set('foo', fooValue);
  const result = client.get('foo');
  result.pop();
  t.is(result.length, 1);
  const repeat = client.get('foo');
  t.is(repeat.length, 2);
});

test('get -> cache is not too slow', (t) => {
  t.timeout(60e3);
  const client = new CacheingClient({ ttl: 60e3 });
  const start = process.hrtime.bigint();
  let iteration = 0;
  while (iteration < 1000) {
    iteration += 1;
    client.set('dependencies', dependencies);
    client.get('dependencies');
    client.get('dependencies');
  }

  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1e9;
  t.true(duration < 50);
});

test('memoise -> memoises an arbitrary function', async (t) => {
  const client = new CacheingClient({ ttl: 500 });
  const fn = sinon.spy(async (arg) => `arg was ${arg}`);
  const memoised = client.memoise(fn);
  const first = await memoised('test');
  const second = await memoised('test');
  t.is(fn.callCount, 1);
  t.is(first, second);
});

test('memoise -> memo does not last beyond the ttl', async (t) => {
  const client = new CacheingClient({ ttl: 50 });
  const fn = sinon.spy(async (arg) => `arg was ${arg}`);
  const memoised = client.memoise(fn);
  const first = await memoised('test');
  await delay(50);
  const second = await memoised('test');
  t.is(fn.callCount, 2);
  t.is(first, second);
});

test('memoise -> memo is per arg', async (t) => {
  const client = new CacheingClient({ ttl: 50 });
  const fn = sinon.spy(async (arg) => `arg was ${arg}`);
  const memoised = client.memoise(fn);
  const first = await memoised('one');
  const second = await memoised('two');
  t.is(fn.callCount, 2);
  t.not(first, second);
});

test('memoise -> multiple args are factored into memo', async (t) => {
  const client = new CacheingClient({ ttl: 50 });
  const fn = sinon.spy(
    async (arg, other) => `arg was ${arg}, other was ${other}`,
  );
  const memoised = client.memoise(fn);
  const first = await memoised('one');
  const second = await memoised('one', 'different');
  t.is(fn.callCount, 2);
  t.not(first, second);
});
