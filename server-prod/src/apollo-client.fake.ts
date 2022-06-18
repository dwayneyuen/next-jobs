/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ApolloCache,
  ApolloClient,
  ApolloClientOptions,
  ApolloLink,
  ApolloQueryResult,
  DataProxy,
  DefaultOptions,
  FetchResult,
  FragmentMatcher,
  GraphQLRequest,
  MutationOptions,
  NormalizedCacheObject,
  Observable,
  ObservableQuery,
  QueryOptions,
  RefetchQueriesInclude,
  RefetchQueriesOptions,
  RefetchQueriesResult,
  Resolvers,
  SubscriptionOptions,
  WatchQueryOptions,
} from "@apollo/client";
import { ExecutionResult } from "graphql";

/**
 * Stubbed ApolloClient to be used in tests
 *
 * The ts-ignore is because the ApolloClient class being implemented has
 * private members. See this github issue:
 * https://github.com/microsoft/TypeScript/issues/471
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ApolloClientFake implements ApolloClient<NormalizedCacheObject> {
  __actionHookForDevTools(cb: () => any): void {}

  __requestRaw(payload: GraphQLRequest): Observable<ExecutionResult> {
    return undefined;
  }

  addResolvers(resolvers: Resolvers | Resolvers[]): void {}

  cache: ApolloCache<NormalizedCacheObject>;

  clearStore(): Promise<any[]> {
    return Promise.resolve([]);
  }

  private clearStoreCallbacks;
  defaultOptions: DefaultOptions;
  private devToolsHookCb;
  disableNetworkFetches: boolean;

  extract(optimistic: boolean | undefined): NormalizedCacheObject {
    return undefined;
  }

  getObservableQueries(
    include: RefetchQueriesInclude | undefined,
  ): Map<string, ObservableQuery<any>> {
    return undefined;
  }

  getResolvers(): Resolvers {
    return undefined;
  }

  link: ApolloLink;
  private localState;

  mutate<TData, TVariables, TContext, TCache>(
    options: MutationOptions<TData, TVariables, TContext>,
  ): Promise<FetchResult<TData>> {
    return Promise.resolve(undefined);
  }

  onClearStore(cb: () => Promise<any>): () => void {
    return function () {};
  }

  onResetStore(cb: () => Promise<any>): () => void {
    return function () {};
  }

  query<T, TVariables>(
    options: QueryOptions<TVariables, T>,
  ): Promise<ApolloQueryResult<T>> {
    return Promise.resolve(undefined);
  }

  queryDeduplication: boolean;
  private queryManager;

  reFetchObservableQueries(
    includeStandby: boolean | undefined,
  ): Promise<ApolloQueryResult<any>[]> {
    return Promise.resolve([]);
  }

  refetchQueries<TCache extends ApolloCache<NormalizedCacheObject>, TResult>(
    options: RefetchQueriesOptions<TCache, TResult>,
  ): RefetchQueriesResult<TResult> {
    return undefined;
  }

  resetStore(): Promise<ApolloQueryResult<any>[] | null> {
    return Promise.resolve(undefined);
  }

  private resetStoreCallbacks;

  restore(
    serializedState: NormalizedCacheObject,
  ): ApolloCache<NormalizedCacheObject> {
    return undefined;
  }

  setLink(newLink: ApolloLink): void {}

  setLocalStateFragmentMatcher(fragmentMatcher: FragmentMatcher): void {}

  setResolvers(resolvers: Resolvers | Resolvers[]): void {}

  stop(): void {}

  subscribe<T, TVariables>(
    options: SubscriptionOptions<TVariables, T>,
  ): Observable<FetchResult<T>> {
    return undefined;
  }

  readonly typeDefs: ApolloClientOptions<NormalizedCacheObject>["typeDefs"];
  version: string;

  watchQuery<T, TVariables>(
    options: WatchQueryOptions<TVariables, T>,
  ): ObservableQuery<T, TVariables> {
    return undefined;
  }

  readFragment<FragmentType, TVariables = any>(
    options: DataProxy.ReadFragmentOptions<FragmentType, TVariables>,
    optimistic?: boolean,
  ): FragmentType | null {
    return undefined;
  }

  readQuery<QueryType, TVariables = any>(
    options: DataProxy.ReadQueryOptions<QueryType, TVariables>,
    optimistic?: boolean,
  ): QueryType | null {
    return undefined;
  }

  writeFragment<TData = any, TVariables = any>(
    options: DataProxy.WriteFragmentOptions<TData, TVariables>,
  ): void {}

  writeQuery<TData = any, TVariables = any>(
    options: DataProxy.WriteQueryOptions<TData, TVariables>,
  ): void {}
}
