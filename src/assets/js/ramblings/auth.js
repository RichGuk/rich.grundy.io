import { Auth0Client } from '@auth0/auth0-spa-js'
import { useState, useEffect } from 'preact/hooks'

const SHARE_URL = `${window.location.origin}/ramblings/share/`

const auth0 = new Auth0Client({
  domain: 'dev-ikrf4ilp.eu.auth0.com',
  client_id: '6QI7A2qEbEyEF6SgX8TqQOum7samMbxW',
  cacheLocation: 'localstorage',
  redirect_uri: SHARE_URL,
  audience: 'https://rich.grundy.io'
})

const useAuth = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const fetchUser = async () => {
    const query = window.location.search
    if (query.includes('code=') && query.includes('state=')) {
      await auth0.handleRedirectCallback()
      const token = await auth0.getTokenSilently()
      setToken(token)

      window.history.replaceState({}, document.title, '/ramblings/share')
    } else {
      try {
        const token = await auth0.getTokenSilently()
        setToken(token)
      } catch (error) {
        console.log(error)
        if (error.error === 'login_required') {
          await auth0.loginWithRedirect()
          return
        }

        throw error
      }
    }

    const user = await auth0.getUser()
    setUser(user)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const login = async () => {
    await auth0.loginWithRedirect()
  }

  const logout = () => {
    auth0.logout({
      returnTo: SHARE_URL
    })
  }

  return {
    isAuthenticated: user != null,
    user,
    token,
    login,
    logout
  }
}

export default useAuth
