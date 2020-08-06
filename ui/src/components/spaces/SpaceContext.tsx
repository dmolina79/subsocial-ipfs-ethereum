import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext, openStore, openIdCounter } from '../orbitdb';
import { SpaceDto } from './types';
import { Loading } from '../utils';
import { useRouter } from 'next/router';

export const MY_SPACES_STORE = 'mySpacesStoreAddress' 

export type SpaceStore = DocStore<SpaceDto>

type SpaceStoreContextType = {
  nextSpaceId?: CounterStore,
  spaceStore: SpaceStore,
  spacesPath: string,
}

export const SpaceStoreContext = createContext<SpaceStoreContextType>({ 
  nextSpaceId: {} as any,
  spaceStore: {} as any,
  spacesPath: ''
});

export const useSpaceStoreContext = () =>
  useContext(SpaceStoreContext)

export const SpaceStoreProvider = ({ spaceStoreLink, children }: React.PropsWithChildren<{ spaceStoreLink: string | null }>) => {
  const [ state, setState ] = useState<SpaceStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {
    let nextSpaceId: CounterStore;
    let spaceStore: SpaceStore;
    async function init() {

      console.log('Before init space counter')
      nextSpaceId = await openIdCounter(orbitdb, 'next_space_id')

      await nextSpaceId.load()

      console.log('After init space counter')

      spaceStore = await openStore<SpaceStore>(orbitdb, spaceStoreLink || 'spaces')

      await spaceStore.load()

      console.log('spaceStore', spaceStore)

      const spacesPath = spaceStore.id
      !spaceStoreLink && localStorage.setItem(MY_SPACES_STORE, spacesPath)
  
      setState({ spaceStore, nextSpaceId, spacesPath: spacesPath });
    }
    init()

    return () => {
      nextSpaceId && nextSpaceId.close()
      spaceStore && spaceStore.close()
    }
  }, [ spaceStoreLink ])

  return state
    ? <SpaceStoreContext.Provider
        value={state}>
          {children}
      </SpaceStoreContext.Provider>
    : <Loading label='Initialization space context'/>
  }


const SpaceStoreWrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { pathname } = useRouter()

  if (pathname.includes('feed')) return <>{children}</>;

  const spaceStoreLink = localStorage.getItem(MY_SPACES_STORE)

  return <SpaceStoreProvider spaceStoreLink={spaceStoreLink}>{children}</SpaceStoreProvider>
}

export default SpaceStoreWrapper
