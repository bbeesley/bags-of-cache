[@beesley/bags-of-cache - v0.0.0](../README.md) / [Modules](../modules.md) / [cacheing-client](../modules/cacheing_client.md) / CacheingClient

# Class: CacheingClient

[cacheing-client](../modules/cacheing_client.md).CacheingClient

Base client used to create clients with in memory caches

**`Export`**

## Hierarchy

- **`CacheingClient`**

  ↳ [`DynamoCachedClient`](dynamo_client.DynamoCachedClient.md)

## Table of contents

### Constructors

- [constructor](cacheing_client.CacheingClient.md#constructor)

### Properties

- [cache](cacheing_client.CacheingClient.md#cache)
- [log](cacheing_client.CacheingClient.md#log)
- [ttl](cacheing_client.CacheingClient.md#ttl)

### Methods

- [createCacheKey](cacheing_client.CacheingClient.md#createcachekey)
- [get](cacheing_client.CacheingClient.md#get)
- [memoise](cacheing_client.CacheingClient.md#memoise)
- [set](cacheing_client.CacheingClient.md#set)
- [stop](cacheing_client.CacheingClient.md#stop)

## Constructors

### constructor

• **new CacheingClient**(`parameters`)

Creates an instance of CacheingClient.

**`Memberof`**

CacheingClient

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `parameters` | [`CacheingClientParameters`](../modules/cacheing_client.md#cacheingclientparameters) | Setup params including ttl and an optional logger |

#### Defined in

cacheing-client.ts:26

## Properties

### cache

• `Protected` **cache**: `TTLCache`<`string`, `Buffer`\>

#### Defined in

cacheing-client.ts:18

___

### log

• `Protected` **log**: `Console`

#### Defined in

cacheing-client.ts:19

___

### ttl

• **ttl**: `number`

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

#### Defined in

cacheing-client.ts:46

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

#### Defined in

cacheing-client.ts:59

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

#### Defined in

cacheing-client.ts:92
