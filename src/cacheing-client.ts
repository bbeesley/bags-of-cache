import { serialize, deserialize } from 'node:v8';
import TTLCache from '@isaacs/ttlcache';

export type CacheingClientParameters = {
  [key: string]: any;
  ttl: number;
};

/**
 * Base client used to create clients with in memory caches
 *
 * @export
 * @class CacheingClient
 */
export class CacheingClient {
  public ttl: number;
  protected cache: TTLCache<string, Uint8Array>;
  protected log: typeof console;

  /**
   * Creates an instance of CacheingClient.
   * @param {CacheingClientParameters} parameters Setup params including ttl and an optional logger
   * @memberof CacheingClient
   */
  constructor(parameters: CacheingClientParameters) {
    this.ttl = parameters.ttl;
    this.cache = new TTLCache({
      ttl: this.ttl,
      dispose: (v, k, r) => {
        if ((r as string) === 'stale') {
          this.log.debug(`dropping cache key ${k} as ttl expired`);
        }
      },
    });
    this.log = console;
  }

  /**
   * Gets an item in the cache
   *
   * @param {string} key The cache key
   * @returns {*}  {*}
   * @memberof CacheingClient
   */
  public get(key: string): any {
    const v = this.cache.get(key);
    return v ? deserialize(v) : v;
  }

  /**
   * Memoises an arbitrary function using the cache
   *
   * @template T
   * @param {T} fn Any async function
   * @returns {*}  {T} Memoised version of the function
   * @memberof CacheingClient
   */
  public memoise<T extends (...args: any[]) => Promise<any>>(fn: T): T {
    const memoisedFn = (async (...args: any[]) => {
      const key = this.createCacheKey(...args); // eslint-disable-line @typescript-eslint/no-unsafe-argument

      const cached = this.get(key); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      if (cached) return cached; // eslint-disable-line @typescript-eslint/no-unsafe-return

      const response = await fn(...args); // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument

      this.set(key, response);
      return response; // eslint-disable-line @typescript-eslint/no-unsafe-return
    }) as T;
    return memoisedFn;
  }

  /**
   * Sets an item in the cache
   *
   * @param {string} key The cache key
   * @param {*} value The thing to be cached
   * @param {number} customTtl Override the default ttl
   * @memberof CacheingClient
   */
  public set(key: string, value: any, customTtl?: number): void {
    this.cache.set(key, new Uint8Array(serialize(value)), {
      ttl: customTtl,
    });
  }

  /**
   * Empties the cache
   *
   * @memberof CacheingClient
   */
  public stop(): void {
    this.cache.clear();
  }

  /**
   * Util to serialise stuff to use as a cache key
   *
   * @protected
   * @param {...any[]} args Arguments to pass to serialise
   * @returns {*}  {string}
   * @memberof CacheingClient
   */
  protected createCacheKey(...args: any[]): string {
    return args.join('#');
  }
}
