import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: "Mutation";
  savePaypalSubscription?: Maybe<PaypalSubscriptionModel>;
};

export type MutationSavePaypalSubscriptionArgs = {
  planId: Scalars["String"];
  subscriptionId: Scalars["String"];
};

export type PaypalSubscriptionModel = {
  __typename?: "PaypalSubscriptionModel";
  id: Scalars["String"];
  planId: Scalars["String"];
  subscriptionId: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  getMe?: Maybe<UserModel>;
  paypal: Scalars["Boolean"];
};

export enum SubscriptionStatus {
  Active = "ACTIVE",
  ApprovalPending = "APPROVAL_PENDING",
  Approved = "APPROVED",
  Cancelled = "CANCELLED",
  Expired = "EXPIRED",
  Suspended = "SUSPENDED",
}

export type UserModel = {
  __typename?: "UserModel";
  accessToken: Scalars["String"];
  baseUrl?: Maybe<Scalars["String"]>;
  email: Scalars["String"];
  id: Scalars["String"];
  subscriptionStatus?: Maybe<SubscriptionStatus>;
};

export type SavePaypalSubscriptionMutationVariables = Exact<{
  planId: Scalars["String"];
  subscriptionId: Scalars["String"];
}>;

export type SavePaypalSubscriptionMutation = {
  __typename?: "Mutation";
  savePaypalSubscription?: {
    __typename?: "PaypalSubscriptionModel";
    id: string;
  } | null;
};

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;

export type GetMeQuery = {
  __typename?: "Query";
  getMe?: {
    __typename?: "UserModel";
    accessToken: string;
    email: string;
    id: string;
  } | null;
};

export type GetSubscriptionStatusQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetSubscriptionStatusQuery = {
  __typename?: "Query";
  getMe?: {
    __typename?: "UserModel";
    id: string;
    subscriptionStatus?: SubscriptionStatus | null;
  } | null;
};

export const SavePaypalSubscriptionDocument = gql`
  mutation savePaypalSubscription($planId: String!, $subscriptionId: String!) {
    savePaypalSubscription(planId: $planId, subscriptionId: $subscriptionId) {
      id
    }
  }
`;
export type SavePaypalSubscriptionMutationFn = Apollo.MutationFunction<
  SavePaypalSubscriptionMutation,
  SavePaypalSubscriptionMutationVariables
>;

/**
 * __useSavePaypalSubscriptionMutation__
 *
 * To run a mutation, you first call `useSavePaypalSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSavePaypalSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [savePaypalSubscriptionMutation, { data, loading, error }] = useSavePaypalSubscriptionMutation({
 *   variables: {
 *      planId: // value for 'planId'
 *      subscriptionId: // value for 'subscriptionId'
 *   },
 * });
 */
export function useSavePaypalSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SavePaypalSubscriptionMutation,
    SavePaypalSubscriptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SavePaypalSubscriptionMutation,
    SavePaypalSubscriptionMutationVariables
  >(SavePaypalSubscriptionDocument, options);
}
export type SavePaypalSubscriptionMutationHookResult = ReturnType<
  typeof useSavePaypalSubscriptionMutation
>;
export type SavePaypalSubscriptionMutationResult =
  Apollo.MutationResult<SavePaypalSubscriptionMutation>;
export type SavePaypalSubscriptionMutationOptions = Apollo.BaseMutationOptions<
  SavePaypalSubscriptionMutation,
  SavePaypalSubscriptionMutationVariables
>;
export const GetMeDocument = gql`
  query getMe {
    getMe {
      accessToken
      email
      id
    }
  }
`;

/**
 * __useGetMeQuery__
 *
 * To run a query within a React component, call `useGetMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeQuery(
  baseOptions?: Apollo.QueryHookOptions<GetMeQuery, GetMeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMeQuery, GetMeQueryVariables>(
    GetMeDocument,
    options
  );
}
export function useGetMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetMeQuery, GetMeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMeQuery, GetMeQueryVariables>(
    GetMeDocument,
    options
  );
}
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>;
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>;
export type GetMeQueryResult = Apollo.QueryResult<
  GetMeQuery,
  GetMeQueryVariables
>;
export const GetSubscriptionStatusDocument = gql`
  query getSubscriptionStatus {
    getMe {
      id
      subscriptionStatus
    }
  }
`;

/**
 * __useGetSubscriptionStatusQuery__
 *
 * To run a query within a React component, call `useGetSubscriptionStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSubscriptionStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSubscriptionStatusQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSubscriptionStatusQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSubscriptionStatusQuery,
    GetSubscriptionStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSubscriptionStatusQuery,
    GetSubscriptionStatusQueryVariables
  >(GetSubscriptionStatusDocument, options);
}
export function useGetSubscriptionStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSubscriptionStatusQuery,
    GetSubscriptionStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSubscriptionStatusQuery,
    GetSubscriptionStatusQueryVariables
  >(GetSubscriptionStatusDocument, options);
}
export type GetSubscriptionStatusQueryHookResult = ReturnType<
  typeof useGetSubscriptionStatusQuery
>;
export type GetSubscriptionStatusLazyQueryHookResult = ReturnType<
  typeof useGetSubscriptionStatusLazyQuery
>;
export type GetSubscriptionStatusQueryResult = Apollo.QueryResult<
  GetSubscriptionStatusQuery,
  GetSubscriptionStatusQueryVariables
>;
