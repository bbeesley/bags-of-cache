import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  paginateQuery,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import PLimit, { type LimitFunction } from 'p-limit';
import {
  CacheingClient,
  type CacheingClientParameters,
} from './cacheing-client.js';

export type DynamoCachedClientParameters = CacheingClientParameters & {
  dynamoTable: string;
  awsRegion: string;
  /**
   * When we get no items back from a query we will not retry the query within this time (ms)
   *
   * @type {number}
   */
  emptyResponseCacheTime?: number;

  /**
   * Limit concurrently sent queries to this value
   *
   * @type {number}
   */
  queryConcurrency?: number;

  /**
   * Limit concurrent getItem calls to this value
   *
   * @type {number}
   */
  getConcurrency?: number;
};

/**
 * Client for dynamo tables. Makes dynamo requests and caches the results.
 *
 * @export
 * @class DynamoCachedClient
 * @extends {CacheingClient}
 */
export class DynamoCachedClient extends CacheingClient {
  public client: DynamoDBDocumentClient;
  protected emptyResponseCacheTime: number;
  protected getLimit: LimitFunction | undefined;
  protected queryLimit: LimitFunction | undefined;
  protected region: string;
  protected table: string;

  /**
   * Creates an instance of DynamoCachedClient.
   *
   * @param {DynamoCachedClientParameters} parameters Config setting information about the dynamo table and the cache ttl
   * @memberof DynamoCachedClient
   */
  constructor(parameters: DynamoCachedClientParameters) {
    super(parameters);
    this.table = parameters.dynamoTable;
    this.region = parameters.awsRegion;
    const dynamo = new DynamoDBClient({ region: this.region });
    this.client = DynamoDBDocumentClient.from(dynamo);
    this.emptyResponseCacheTime = parameters.emptyResponseCacheTime ?? 10e3;
    if (parameters.queryConcurrency)
      this.queryLimit = PLimit(parameters.queryConcurrency); // eslint-disable-line new-cap
    if (parameters.getConcurrency)
      this.getLimit = PLimit(parameters.getConcurrency); // eslint-disable-line new-cap
  }

  /**
   * Gets a single item from the table by key and caches the result
   *
   * @template T
   * @param {Record<string, any>} key The dynamo key object
   * @returns {*}  {(Promise<T | undefined>)}
   * @memberof DynamoCachedClient
   */
  public async getItem<T extends Record<string, any>>(
    key: Record<string, any>,
  ): Promise<T | undefined> {
    const cacheKey = this.createCacheKey('getItem', JSON.stringify(key));
    const cachedItem = this.get(cacheKey); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    if (cachedItem) return cachedItem as T;
    const response = this.getLimit
      ? await this.getLimit(async () =>
          this.client.send(
            new GetCommand({
              TableName: this.table,
              Key: key,
            }),
          ),
        )
      : await this.client.send(
          new GetCommand({
            TableName: this.table,
            Key: key,
          }),
        );
    if (response.Item) {
      this.set(cacheKey, response.Item);
      return response.Item as T;
    }

    return undefined;
  }

  /**
   * Sends an arbitrary dynamo query, cacheing the results
   *
   * @template T
   * @param {Partial<QueryCommandInput>} input The dynamo query command input
   * @returns {*}  {Promise<T[]>}
   * @memberof DynamoCachedClient
   */
  public async query<T extends Record<string, any>>(
    input: Partial<QueryCommandInput>,
  ): Promise<T[]> {
    // First check the cache, no point queueing the query if we have a cached response
    const cacheKey = this.createCacheKey('query', JSON.stringify(input));
    const cachedItem = this.get(cacheKey); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    if (cachedItem) return cachedItem as T[];

    // If we got nothing from the cache then queue the query
    const results = this.queryLimit
      ? await this.queryLimit(async () => this.sendQuery(input))
      : await this.sendQuery(input);

    return results as T[];
  }

  /**
   * Un-throttled method to send query
   *
   * @private
   * @template T
   * @param {Partial<QueryCommandInput>} input The dynamo query command input
   * @returns {*}  {Promise<T[]>}
   * @memberof DynamoCachedClient
   */
  private async sendQuery<T extends Record<string, any>>(
    input: Partial<QueryCommandInput>,
  ): Promise<T[]> {
    // First check the cache, this query may have been queued and a cached response may have been saved since this query was enqueued
    const cacheKey = this.createCacheKey('query', JSON.stringify(input));
    const cachedItem = this.get(cacheKey); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
    if (cachedItem) return cachedItem as T[];

    const q = paginateQuery(
      { client: this.client },
      {
        TableName: this.table,
        ...input,
      },
    );
    const results: T[] = [];
    for await (const result of q) {
      results.push(...((result.Items as T[]) ?? []));
    }

    // Cache the response here since we know its fresh
    if (results) {
      this.set(cacheKey, results);
      return results;
    }

    this.set(cacheKey, [], this.emptyResponseCacheTime);
    return [];
  }
}
