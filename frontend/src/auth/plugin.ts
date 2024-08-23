import { App, reactive, readonly, ref } from 'vue'
import { setupDevtools } from './devtools'
import { configureAuthorizationHeaderInterceptor } from './interceptors'
import { configureNavigationGuards } from './navigationGuards'
import { ANONYMOUS_USER, AuthOptions, AuthPlugin, RequiredAuthOptions, IUser } from './types'
import { supabase } from '@/api/supabase'
import { User } from '@supabase/supabase-js'

export let authInstance: AuthPlugin | undefined = undefined

function setupAuthPlugin(options: RequiredAuthOptions): AuthPlugin {
  const router = options.router
  const isAuthenticated = ref(false)
  const accessToken = ref<string>()
  const user = ref<IUser>({ ...ANONYMOUS_USER })

  async function getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  }

  async function getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    accessToken.value = data.session?.access_token

    const authenticatedUser = {
      id: data.user?.id,
      email: data.user?.email,
    }

    user.value = authenticatedUser
    isAuthenticated.value = true
  }

  async function loginWithOtp(email: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: token,
      type: 'email',
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw 'user not found'
    }

    const { id } = data.user

    user.value = {
      id,
      email,
    }

    isAuthenticated.value = true

    const roles = ['CLIENT', 'TEAM_OWNER']
    await upsertProfile(data.user, roles)

    router.push(router.currentRoute.value.query.redirectTo?.toString() || options.loginRedirectRoute)
  }

  async function loginWithToken(token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw 'user not found'
    }

    const { id, email } = data.user

    user.value = {
      id,
      email,
    }

    isAuthenticated.value = true
  }

  async function logout() {
    await supabase.auth.signOut()

    localStorage.clear()

    user.value = { ...ANONYMOUS_USER }
    isAuthenticated.value = false
    accessToken.value = undefined
    router.push(options.logoutRedirectRoute)
  }

  async function preregister(email: string) {
    const { data, error } = await supabase.rpc('fn_email_registration_insert', { _email: email })

    if (error) {
      throw error
    }
  }

  async function setPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })
  }

  async function setPhoneNumber(phoneNumber: string) {
    let newPhoneNumber = ''

    // Check if phoneNumber already starts with +
    if (!phoneNumber.startsWith('+') && phoneNumber.length > 0) {
      // Check if phoneNumber starts with 1
      if (phoneNumber.startsWith('1')) {
        // Add + as a prefix
        newPhoneNumber = '+' + phoneNumber
      } else {
        // Add +1 as a prefix
        newPhoneNumber = '+1' + phoneNumber
      }
    }

    const { data, error } = await supabase.auth.updateUser({
      phone: newPhoneNumber,
    })
  }

  async function signup(firstName: string, lastName: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
        },
      },
    })

    if (error) {
      throw error
    }

    localStorage.setItem('registration-data', JSON.stringify({ regEmail: email, firstName, lastName }))
  }

  async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      throw error
    }
  }

  async function sendSmsOtp(phoneNumber: string) {
    let newPhoneNumber = ''

    // Check if phoneNumber already starts with +
    if (!phoneNumber.startsWith('+') && phoneNumber.length > 0) {
      // Check if phoneNumber starts with 1
      if (phoneNumber.startsWith('1')) {
        // Add + as a prefix
        newPhoneNumber = '+' + phoneNumber
      } else {
        // Add +1 as a prefix
        newPhoneNumber = '+1' + phoneNumber
      }
    }

    const { data, error } = await supabase.auth.signInWithOtp({ phone: newPhoneNumber })

    if (error) {
      throw error
    }
  }

  async function retrieveSession() {
    // attempt to get a current session
    const session = await getSession()

    // if there is a session, then get the user
    if (session?.access_token) {
      const currentUser = await getUser()

      if (currentUser && session?.access_token) {
        accessToken.value = session.access_token

        const authenticatedUser = {
          id: currentUser.id,
          email: currentUser.email,
        }

        user.value = authenticatedUser
        isAuthenticated.value = true
      }
    }
  }

  async function upsertProfile(user: User, roles?: string[]) {
    const { firstName, lastName } = user.user_metadata
    const { id } = user

    const obj: any = {
      _user_id: id,
      _first_name: firstName,
      _last_name: lastName,
      _profile_url: undefined,
    }

    if (roles) {
      obj['_roles'] = roles
    }

    const { data, error } = await supabase.rpc('fn_profile_and_relationship_upsert', obj)
  }

  async function verifySmsOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
  }

  /**
   * @description Validates if the email is valid for registration
   * @param email
   * @memberof setupAuthPlugin
   */
  async function validateRegistration(email: string) {
    let isEmailRegistrationValid = false

    try {
      const blah = await supabase.rpc('fn_email_registration_valid', {
        _email: email,
      })

      if (blah.error) {
        throw blah.error
      }

      if (!blah.data) {
        return isEmailRegistrationValid
      }
    } catch (err) {
      console.error('Error confirming fn_email_registration_valid:', err)
      throw err
    }

    isEmailRegistrationValid = true

    return isEmailRegistrationValid
  }

  /*
   * "reactive" unwraps 'ref's, therefore using the .value is not required.
   * E.g: from "auth.isAuthenticated.value" to "auth.isAuthenticated"
   * but when using destructuring like: { isAuthenticated } = useAuth() the reactivity over isAuthenticated would be lost
   * this is not recommended but in such case use toRefs: { isAuthenticated } = toRefs(useAuth())
   * See: https://v3.vuejs.org/guide/reactivity-fundamentals.html#ref-unwrapping
   * And: https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
   */
  const unWrappedRefs = reactive({
    isAuthenticated,
    accessToken,
    user,
    login,
    loginWithOtp,
    loginWithToken,
    logout,
    preregister,
    resetPassword,
    retrieveSession,
    sendSmsOtp,
    setPassword,
    setPhoneNumber,
    signup,
    validateRegistration,
    verifySmsOtp,
  })

  return readonly(unWrappedRefs)
}

const defaultOptions = {
  loginRedirectRoute: '/',
  logoutRedirectRoute: '/',
  loginRouteName: 'login',
  autoConfigureNavigationGuards: true,
}
export function createAuth(appOptions: AuthOptions) {
  // Fill default values to options that were not received
  const options: RequiredAuthOptions = { ...defaultOptions, ...appOptions }

  return {
    install: (app: App): void => {
      authInstance = setupAuthPlugin(options)
      app.config.globalProperties.$auth = authInstance

      if (options.autoConfigureNavigationGuards) {
        configureNavigationGuards(options.router, options)
      }

      if (options.axios?.autoAddAuthorizationHeader) {
        configureAuthorizationHeaderInterceptor(options.axios.instance, options.axios.authorizationHeaderPrefix)
      }

      if (import.meta.env.DEV) {
        setupDevtools(app, authInstance)
      }
    },
  }
}
