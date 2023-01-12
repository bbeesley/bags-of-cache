# @beesley/bags-of-cache

This package contains in memory cache tools. A generic in memory cache class is available to be used by other tools.

- [@beesley/bags-of-cache](#beesleybags-of-cache)
  - [Cached Client](#cached-client)
    - [Caveats](#caveats)
    - [Usage](#usage)
    - [Client API](#client-api)
      - [CacheingClient](#cacheingclient)
        - [get](#get)
          - [Parameters](#parameters)
        - [memoise](#memoise)
          - [Parameters](#parameters-1)
        - [set](#set)
          - [Parameters](#parameters-2)
        - [stop](#stop)
        - [createCacheKey](#createcachekey)
          - [Parameters](#parameters-3)
  - [Cached Dynamo Client](#cached-dynamo-client)
    - [Caveats](#caveats-1)
    - [Usage](#usage-1)
    - [Dynamo API](#dynamo-api)
      - [emptyResponseCacheTime](#emptyresponsecachetime)
      - [queryConcurrency](#queryconcurrency)
      - [getConcurrency](#getconcurrency)
      - [DynamoCachedClient](#dynamocachedclient)
        - [getItem](#getitem)
          - [Parameters](#parameters-4)
        - [query](#query)
          - [Parameters](#parameters-5)

## Cached Client

This is the base class used by the other classes in this package. It provides the ttl cache implementation and some basic utilities. In general this class can be used whenever there is a need to make repeated calls to the same expensive function by leveraging an in memory cache with a ttl.

### Caveats

To ensure items in the in memory cache are immutable they are stored in a serialised format, so when an item is saved it is serialized, and each time it is read it is deserialized. The overhead for this is small, we use v8's serialization methods for this, but bear this in mind when weighing up whether or not cacheing will improve performance.

### Usage

```typescript
import { CacheingClient } from '@beesley/bags-of-cache';

const client = new CacheingClient({
  ttl: 60e3, // cache responses for 60 seconds
});

// cache something
const fooValue = 'foo';
client.set('foo', fooValue);

// read from the cache
client.get('foo')

// clear the cache 
client.stop();

// memoise an arbitrary async function, leveraging the in memory cache
const fn = async (arg, other) => `arg was ${arg}, other was ${other}`;
const memoised = client.memoise(fn);
const first = await memoised('one');
const second = await memoised('one'); // this will be returned from the cache
```

### Client API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### CacheingClient

[src/cacheing-client.ts:16-107](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L16-L107 "Source code on GitHub")

Base client used to create clients with in memory caches

##### get

[src/cacheing-client.ts:46-49](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L46-L49 "Source code on GitHub")

Gets an item in the cache

###### Parameters

*   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The cache key

Returns **any** {\*}

##### memoise

[src/cacheing-client.ts:59-71](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L59-L71 "Source code on GitHub")

Memoises an arbitrary function using the cache

###### Parameters

*   `fn` **T** Any async function

Returns **any** {T} Memoised version of the function

##### set

[src/cacheing-client.ts:81-85](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L81-L85 "Source code on GitHub")

Sets an item in the cache

###### Parameters

*   `key` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The cache key
*   `value` **any** The thing to be cached
*   `customTtl` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Override the default ttl

Returns **void**&#x20;

##### stop

[src/cacheing-client.ts:92-94](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L92-L94 "Source code on GitHub")

Empties the cache

Returns **void**&#x20;

##### createCacheKey

[src/cacheing-client.ts:104-106](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/cacheing-client.ts#L104-L106 "Source code on GitHub")

Util to serialise stuff to use as a cache key

###### Parameters

*   `args` **...[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>** Arguments to pass to serialise

Returns **any** {string}

## Cached Dynamo Client

Where repeated calls are made to dynamo for the same content, this cacheing client can be used to reduce the number of requests sent by cacheing the responses. For some access patterns, the same query is often sent again and again, even when it's response changes very infrequently. This can lead to unnecessarily hammering dynamo with the same requests as well as being unnecessarily slow due to these requests. Under those conditions this module can significantly improve performance by cacheing those dynamo responses for a provided ttl.

When sending a query or get command, the client will initially check it's in memory cache for a result before calling dynamo. If the response is in the cache, it is served from the cache and we don't call dynamo. If the response is not in the cache, after calling dynamo it is stored in the cache for the provided ttl.

It is also possible to individually limit the concurrency of query and get commands to dynamo. This can be used to generally throttle the rate at which dynamo requests are made. A particularly useful case for this though is when you know your application is going to make the same request repeatedly and the queryConcurrency is set to 1, the first of those queries will go to dynamo and any more requests for the same query will be paused until that first response comes back. Each of those paused queries will be resolved with the cached value from that initial request as soon as that first response comes back (basically dogpile protection).

### Caveats

For situations where the same request for config is repeatedly made, this module should dramatically improve performance. However, to ensure items in the in memory cache are immutable they are stored in a serialised format, so when an item is saved it is serialized, and each time it is read it is deserialized. The overhead for this is small, we use v8's serialization methods for this, but if your access pattern is such that the same queries are unlikely to be repeated, the only impact from using this library would be an increase in memory use and slower responses (due to serializing each item that gets cached). So consider your access pattern and decide for yourself whether this is the right solution.

### Usage

```typescript
import { DynamoCachedClient } from '@beesley/bags-of-cache/dynamo';

const client = new DynamoCachedClient({
  ttl: 60e3, // cache responses for 60 seconds
  dynamoTable: 'my-config-dev',
  awsRegion: 'eu-central-1',
  queryConcurrency: 1, // only allow 1 concurrent dynamo query command - optional
  getConcurrency: 1, // only allow 1 concurrent dynamo getItem command - optional
});

// send an arbitrary query, leveraging the in memory cache
const configItems = await client.query({
  TableName: 'big-prod-table',
  KeyConditionExpression: '#type = :type',
  FilterExpression: '#country = :country AND #language = :language',
  ExpressionAttributeNames: {
    '#type': 'type',
    '#country': 'country',
    '#language': 'language',
  },
  ExpressionAttributeValues: {
    ':configType': 'track',
    ':country': 'de',
    ':language': 'default',
  },
});

// get an arbitrary item, leveraging the in memory cache
const item = await client.getItem({
  country: 'de',
  pk: 'foo',
});
```

### Dynamo API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### emptyResponseCacheTime

[src/dynamo-client.ts:23-23](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L23-L23 "Source code on GitHub")

When we get no items back from a query we will not retry the query within this time (ms)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

#### queryConcurrency

[src/dynamo-client.ts:30-30](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L30-L30 "Source code on GitHub")

Limit concurrently sent queries to this value

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

#### getConcurrency

[src/dynamo-client.ts:37-37](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L37-L37 "Source code on GitHub")

Limit concurrent getItem calls to this value

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

#### DynamoCachedClient

[src/dynamo-client.ts:47-173](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L47-L173 "Source code on GitHub")

**Extends CacheingClient**

Client for dynamo tables. Makes dynamo requests and caches the results.

##### getItem

[src/dynamo-client.ts:82-109](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L82-L109 "Source code on GitHub")

Gets a single item from the table by key and caches the result

###### Parameters

*   `key` **Record<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), any>** The dynamo key object

Returns **any** {(Promise\<T | undefined>)}

##### query

[src/dynamo-client.ts:119-133](https://github.com/bbeesley/bags-of-cache/blob/c25486e7861143f9c3fe9d0e594c131dde0c89ce/src/dynamo-client.ts#L119-L133 "Source code on GitHub")

Sends an arbitrary dynamo query, cacheing the results

###### Parameters

*   `input` **Partial\<QueryCommandInput>** The dynamo query command input

Returns **any** {Promise\<T\[]>}
