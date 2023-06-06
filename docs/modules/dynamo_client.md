[@beesley/bags-of-cache](../README.md) / [Modules](../modules.md) / dynamo-client

# dynamo-client

## Table of contents

### Classes

- [DynamoCachedClient](../classes/dynamo_client.DynamoCachedClient.md)

### Type Aliases

- [DynamoCachedClientParameters](dynamo_client.md#dynamocachedclientparameters)

## Type Aliases

### DynamoCachedClientParameters

Ƭ **DynamoCachedClientParameters**: [`CacheingClientParameters`](cacheing_client.md#cacheingclientparameters) & { `awsRegion`: `string` ; `dynamoTable`: `string` ; `emptyResponseCacheTime?`: `number` ; `getConcurrency?`: `number` ; `queryConcurrency?`: `number`  }

#### Defined in

[dynamo-client.ts:15](https://github.com/bbeesley/bags-of-cache/blob/main/src/dynamo-client.ts#L15)
