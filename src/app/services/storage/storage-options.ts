export interface LimitedCacheOptions<T> {
  maxLength: number;
  allowDuplicates?: boolean;
  /** Values in the blacklist array will not be added. */
  blacklist?: T[];
}
