import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { SpaceDto } from './types';

type SpaceStore = DocStore<SpaceDto>

type SpaceStoreContextType = {
  nextSpaceId: CounterStore,
  spaceStore: SpaceStore,
}

export const SpaceStoreContext = createContext<SpaceStoreContextType>({ 
  nextSpaceId: {} as any,
  spaceStore: {} as any, 
});

export const useSpaceStoreContext = () =>
  useContext(SpaceStoreContext)

export const SpaceStoreProvider = (props: React.PropsWithChildren<{}>) => {
  const [ state, setState ] = useState<SpaceStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {
    async function init() {

      const nextSpaceId = await orbitdb.open('next_space_id', {
        create: true,
        type: 'counter',
        replicate: true
      }) as CounterStore

      await nextSpaceId.load()

      const spaceStore: SpaceStore = await orbitdb.docs('spaces', { indexBy: 'id' } as any)

      await spaceStore.load()

      setState({ spaceStore, nextSpaceId })

      if (window) {
        (window as any).spaceStore = spaceStore;
        (window as any).nextSpaceId = nextSpaceId;
      }
    }
    init()
  }, [ false ])

  return state
    ? <SpaceStoreContext.Provider
        value={state}>
          {props.children}
      </SpaceStoreContext.Provider>
    : null
  }

export default SpaceStoreProvider
