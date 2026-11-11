import { Amplify } from 'aws-amplify'
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut as amplifySignOut } from 'aws-amplify/auth'

const config = import.meta.env
const redirectUri = config.VITE_COGNITO_REDIRECT_URI?.replace(
  'https://mitsurufarm.github.io',
  'https://mittsufarm.github.io'
)
export const authConfigured = Boolean(
  config.VITE_COGNITO_USER_POOL_ID &&
    config.VITE_COGNITO_CLIENT_ID &&
    config.VITE_COGNITO_DOMAIN &&
    redirectUri
)

export function configureAuth() {
  if (!authConfigured || !redirectUri) return
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: config.VITE_COGNITO_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: config.VITE_COGNITO_DOMAIN,
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectUri],
            redirectSignOut: [redirectUri],
            responseType: 'code',
          },
        },
      },
    },
  })
}

export const signIn = () => signInWithRedirect()
export const signOut = () => amplifySignOut()

export async function getAccessToken(forceRefresh = false) {
  try {
    const session = await fetchAuthSession({ forceRefresh })
    return session.tokens?.accessToken?.toString()
  } catch {
    return undefined
  }
}

export async function getCurrentAuthState() {
  if (!authConfigured) return null
  try {
    return await getCurrentUser()
  } catch {
    return null
  }
}

