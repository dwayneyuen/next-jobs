/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface User {
  id: string;
  email: string;
}

export interface IMutation {
  createUser(
    email: string,
    password: string,
  ): Nullable<User> | Promise<Nullable<User>>;
}

type Nullable<T> = T | null;
