[@beesley/bags-of-cache - v0.0.0](../README.md) / [Modules](../modules.md) / [dynamo-client](../modules/dynamo_client.md) / DynamoCachedClient

# Class: DynamoCachedClient

[dynamo-client](../modules/dynamo_client.md).DynamoCachedClient

Client for dynamo tables. Makes dynamo requests and caches the results.

**`Export`**

## Hierarchy

- [`CacheingClient`](cacheing_client.CacheingClient.md)

  ↳ **`DynamoCachedClient`**

## Table of contents

### Constructors

- [constructor](dynamo_client.DynamoCachedClient.md#constructor)

### Properties

- [cache](dynamo_client.DynamoCachedClient.md#cache)
- [client](dynamo_client.DynamoCachedClient.md#client)
- [emptyResponseCacheTime](dynamo_client.DynamoCachedClient.md#emptyresponsecachetime)
- [getLimit](dynamo_client.DynamoCachedClient.md#getlimit)
- [log](dynamo_client.DynamoCachedClient.md#log)
- [queryLimit](dynamo_client.DynamoCachedClient.md#querylimit)
- [region](dynamo_client.DynamoCachedClient.md#region)
- [table](dynamo_client.DynamoCachedClient.md#table)
- [ttl](dynamo_client.DynamoCachedClient.md#ttl)

### Methods

- [createCacheKey](dynamo_client.DynamoCachedClient.md#createcachekey)
- [get](dynamo_client.DynamoCachedClient.md#get)
- [getItem](dynamo_client.DynamoCachedClient.md#getitem)
- [memoise](dynamo_client.DynamoCachedClient.md#memoise)
- [query](dynamo_client.DynamoCachedClient.md#query)
- [sendQuery](dynamo_client.DynamoCachedClient.md#sendquery)
- [set](dynamo_client.DynamoCachedClient.md#set)
- [stop](dynamo_client.DynamoCachedClient.md#stop)

## Constructors

### constructor

• **new DynamoCachedClient**(`parameters`)

Creates an instance of DynamoCachedClient.

**`Memberof`**

DynamoCachedClient

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `parameters` | [`DynamoCachedClientParameters`](../modules/dynamo_client.md#dynamocachedclientparameters) | Config setting information about the dynamo table and the cache ttl |

#### Overrides

[CacheingClient](cacheing_client.CacheingClient.md).[constructor](cacheing_client.CacheingClient.md#constructor)

#### Defined in

dynamo-client.ts:61

## Properties

### cache

• `Protected` **cache**: `TTLCache`<`string`, `Buffer`\>

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[cache](cacheing_client.CacheingClient.md#cache)

#### Defined in

cacheing-client.ts:18

___

### client

• **client**: `DynamoDBDocumentClient`

#### Defined in

dynamo-client.ts:48

___

### emptyResponseCacheTime

• `Protected` **emptyResponseCacheTime**: `number`

#### Defined in

dynamo-client.ts:49

___

### getLimit

• `Protected` **getLimit**: `undefined` \| `LimitFunction`

#### Defined in

dynamo-client.ts:50

___

### log

• `Protected` **log**: `Console`

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[log](cacheing_client.CacheingClient.md#log)

#### Defined in

cacheing-client.ts:19

___

### queryLimit

• `Protected` **queryLimit**: `undefined` \| `LimitFunction`

#### Defined in

dynamo-client.ts:51

___

### region

• `Protected` **region**: `string`

#### Defined in

dynamo-client.ts:52

___

### table

• `Protected` **table**: `string`

#### Defined in

dynamo-client.ts:53

___

### ttl

• **ttl**: `number`

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[ttl](cacheing_client.CacheingClient.md#ttl)

#### Defined in

cacheing-client.ts:17

## Methods

### createCacheKey

▸ `Protected` **createCacheKey**(`...args`): `string`

Util to serialise stuff to use as a cache key

**`Memberof`**

CacheingClient

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `...args` | `any`[] | Arguments to pass to serialise |

#### Returns

`string`

{string}

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[createCacheKey](cacheing_client.CacheingClient.md#createcachekey)

#### Defined in

cacheing-client.ts:104

___

### get

▸ **get**(`key`): `any`

Gets an item in the cache

**`Memberof`**

CacheingClient

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The cache key |

#### Returns

`any`

{*}

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[get](cacheing_client.CacheingClient.md#get)

#### Defined in

cacheing-client.ts:46

___

### getItem

▸ **getItem**<`T`\>(`key`): `Promise`<`undefined` \| `T`\>

Gets a single item from the table by key and caches the result

**`Memberof`**

DynamoCachedClient

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `Record`<`string`, `any`\> | The dynamo key object |

#### Returns

`Promise`<`undefined` \| `T`\>

{(Promise<T | undefined>)}

#### Defined in

dynamo-client.ts:82

___

### memoise

▸ **memoise**<`T`\>(`fn`): `T`

Memoises an arbitrary function using the cache

**`Memberof`**

CacheingClient

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends (...`args`: `any`[]) => `Promise`<`any`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `fn` | `T` | Any async function |

#### Returns

`T`

{T} Memoised version of the function

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[memoise](cacheing_client.CacheingClient.md#memoise)

#### Defined in

cacheing-client.ts:59

___

### query

▸ **query**<`T`\>(`input`): `Promise`<`T`[]\>

Sends an arbitrary dynamo query, cacheing the results

**`Memberof`**

DynamoCachedClient

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `Partial`<`QueryCommandInput`\> | The dynamo query command input |

#### Returns

`Promise`<`T`[]\>

{Promise<T[]>}

#### Defined in

dynamo-client.ts:119

___

### sendQuery

▸ `Private` **sendQuery**<`T`\>(`input`): `Promise`<`T`[]\>

Un-throttled method to send query

**`Memberof`**

DynamoCachedClient

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `Partial`<`QueryCommandInput`\> | The dynamo query command input |

#### Returns

`Promise`<`T`[]\>

{Promise<T[]>}

#### Defined in

dynamo-client.ts:144

___

### set

▸ **set**(`key`, `value`, `customTtl?`): `void`

Sets an item in the cache

**`Memberof`**

CacheingClient

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The cache key |
| `value` | `any` | The thing to be cached |
| `customTtl?` | `number` | Override the default ttl |

#### Returns

`void`

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[set](cacheing_client.CacheingClient.md#set)

#### Defined in

cacheing-client.ts:81

___

### stop

▸ **stop**(): `void`

Empties the cache

**`Memberof`**

CacheingClient

#### Returns

`void`

#### Inherited from

[CacheingClient](cacheing_client.CacheingClient.md).[stop](cacheing_client.CacheingClient.md#stop)

#### Defined in

cacheing-client.ts:92
