import { AxiosInstance } from 'axios'
import { RouteLocationRaw, Router, RouteRecordName } from 'vue-router'

export interface IUser {
  id?: string
  email?: string
}

export const ANONYMOUS_USER: Readonly<IUser> = Object.freeze({
  id: undefined,
  firstName: 'Anonymous',
  lastName: '',
})

export interface AuthPlugin {
  readonly user: IUser
  readonly isAuthenticated: boolean
  readonly accessToken?: string
  readonly login: (email: string, password: string) => Promise<void>
  readonly loginWithOtp: (email: string, token: string) => Promise<void>
  readonly loginWithToken: (token: string) => Promise<void>
  readonly logout: () => Promise<void>
  readonly preregister: (email: string) => Promise<void>
  readonly resetPassword: (email: string) => Promise<void>
  readonly retrieveSession: () => Promise<void>
  readonly sendSmsOtp: (phoneNumber: string) => Promise<void>
  readonly setPassword: (password: string) => Promise<void>
  readonly setPhoneNumber: (phoneNumber: string) => Promise<void>
  readonly validateRegistration: (email: string) => Promise<boolean>
  readonly verifySmsOtp: (phoneNumber: string, token: string) => Promise<boolean>
  readonly signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
}

export interface AuthAxiosConfig {
  instance: AxiosInstance
  autoAddAuthorizationHeader: boolean
  authorizationHeaderPrefix?: string
}

export interface RequiredAuthOptions {
  router: Router
  loginRouteName: RouteRecordName
  loginRedirectRoute: RouteLocationRaw
  logoutRedirectRoute: RouteLocationRaw
  autoConfigureNavigationGuards: boolean
  axios?: AuthAxiosConfig
}

/*
 * Make all optional but router
 * See: https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype
 * See: https://stackoverflow.com/a/51507473/4873750
 */
export interface AuthOptions extends Omit<Partial<RequiredAuthOptions>, 'router'> {
  router: Router
}
