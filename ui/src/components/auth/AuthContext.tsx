import React, { useContext, createContext, useState, useEffect } from 'react';
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext, openStore } from '../orbitdb';
import { Loading } from '../utils';

export const MY_PROFILE_STORE = 'myProfileStore' 

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

  useEffect(() => {
    if (!isReady) return

    let profileStore: ProfileStore;
    async function initAuth() {
      const profileStore = await openStore<ProfileStore>(orbitdb, 'profile', 'domain')

      await profileStore.load()

      setStore(profileStore)

      const profile = profileStore.get('').pop()

      setProfile(profile)
    }
    initAuth()

    return () => { profileStore && profileStore.close() }
  }, [ isReady ])

  if (!isReady) return <>{children}</>

  if (!profileStore) return <Loading label='Initialization profile store' />

  const signIn = (profile: Profile) => {
    profileStore.put(profile)
    setProfile(profile)
  }

  const signOut = () => {
    profileStore.drop()
    setProfile(undefined)
  }

  return <AuthContext.Provider value={{
      profile,
      profilePath: profileStore.id,
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