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
  upsertUser: User;
};

export type MutationUpsertUserArgs = {
  auth0Sub: Scalars["String"];
  email: Scalars["String"];
  emailVerified: Scalars["Boolean"];
};

export type Query = {
  __typename?: "Query";
  getUser: User;
};

export type QueryGetUserArgs = {
  email: Scalars["String"];
};

export type User = {
  __typename?: "User";
  email: Scalars["String"];
  id: Scalars["String"];
};

export type UpsertUserMutationVariables = Exact<{
  auth0Sub: Scalars["String"];
  email: Scalars["String"];
  emailVerified: Scalars["Boolean"];
}>;

export type UpsertUserMutation = {
  __typename?: "Mutation";
  upsertUser: { __typename?: "User"; id: string };
};

export const UpsertUserDocument = gql`
  mutation upsertUser(
    $auth0Sub: String!
    $email: String!
    $emailVerified: Boolean!
  ) {
    upsertUser(
      auth0Sub: $auth0Sub
      email: $email
      emailVerified: $emailVerified
    ) {
      id
    }
  }
`;
export type UpsertUserMutationFn = Apollo.MutationFunction<
  UpsertUserMutation,
  UpsertUserMutationVariables
>;

/**
 * __useUpsertUserMutation__
 *
 * To run a mutation, you first call `useUpsertUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUserMutation, { data, loading, error }] = useUpsertUserMutation({
 *   variables: {
 *      auth0Sub: // value for 'auth0Sub'
 *      email: // value for 'email'
 *      emailVerified: // value for 'emailVerified'
 *   },
 * });
 */
export function useUpsertUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUserMutation,
    UpsertUserMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpsertUserMutation, UpsertUserMutationVariables>(
    UpsertUserDocument,
    options
  );
}
export type UpsertUserMutationHookResult = ReturnType<
  typeof useUpsertUserMutation
>;
export type UpsertUserMutationResult =
  Apollo.MutationResult<UpsertUserMutation>;
export type UpsertUserMutationOptions = Apollo.BaseMutationOptions<
  UpsertUserMutation,
  UpsertUserMutationVariables
>;
