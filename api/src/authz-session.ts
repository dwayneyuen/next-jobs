/**
 * The user information attached to Auth0 JWT
 */

type User = {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  locale: string;
  updated_at: Date;
  email: string;
  email_verified: boolean;
  sub: string;
};
export type Auth0Session = {
  user: User;
  idToken: string;
  accessToken: string;
  accessTokenScope: string;
  accessTokenExpiresAt: number;
  token_type: string;
};
