import React, { useContext, createContext, useState, useEffect } from 'react';
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext, openStore } from '../orbitdb';

export const MY_PROFILE_DOMAIN = 'myProfileDomain' 

export type Profile = {
  domain: string,
  wallet: string
}

export type ProfileStore = DocStore<Profile>

type Auth = {
  profile?: Profile,
  profilePath: string,
  signIn: (profile: Profile) => void,
  signOut: () => void,
}

const initialState: Auth = {
  profilePath: '',
  signIn: {} as any,
  signOut: {} as any
}

export const AuthContext = createContext<Auth>(initialState);

export const useAuthContext = () =>
  useContext(AuthContext)

export const AuthProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [ profile, setProfile ] = useState<Profile | undefined>()
  const [ profileStore, setStore ] = useState<ProfileStore>()
  const { orbitdb, isReady } = useOrbitDbContext()

  const openProfileStore = async (path: string) => {
    const profileStore = await openStore<ProfileStore>(orbitdb, path, 'domain')

    await profileStore.load()

    setStore(profileStore)
    return profileStore
  }

  useEffect(() => {
    const profilePath = localStorage.getItem(MY_PROFILE_DOMAIN)

    if (!isReady || !profilePath || profileStore) return

    let store: ProfileStore;

    const initProfile = async () => {
      store = await openProfileStore(profilePath)
      const profile = store.get('').pop()

      setProfile(profile)
    }

    initProfile()
      .catch(err => console.error(err))

    return () => { store && store.close() }
  }, [ isReady, profile ])

  if (!isReady) return <>{children}</>

  const signIn = async (profile: Profile) => {
    let store: ProfileStore;

    if (profileStore) {
      store = profileStore
    } else {
      const domain = profile.domain
      store = await openProfileStore(domain)
      localStorage.setItem(MY_PROFILE_DOMAIN, domain)
    }

    store.put(profile)
    setProfile(profile)
  }

  const signOut = () => {
    profileStore && profileStore.drop()
    setProfile(undefined)
  }

  return <AuthContext.Provider value={{
      profile,
      profilePath: profileStore?.id || '',
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
}

export const useMyDomain = () => {
  const { profile: { domain } = { domain: ''} } = useAuthContext()

  return domain
}

export default AuthProvider