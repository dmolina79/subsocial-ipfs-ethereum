import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { SpaceDto, FollowSpace } from './types';

type SpaceStore = DocStore<SpaceDto>
type FollowSpaceStore = DocStore<FollowSpace>

type SpaceStoreContextType = {
  nextSpaceId: CounterStore,
  spaceStore: SpaceStore,
  followSpaceStore: FollowSpaceStore,
}

export const SpaceStoreContext = createContext<SpaceStoreContextType>({ 
  nextSpaceId: {} as any,
  spaceStore: {} as any,
  followSpaceStore: {} as any
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
        type: 'counter'
      }) as CounterStore

      await nextSpaceId.load()

      const spaceStore: SpaceStore = await orbitdb.docs('spaces', { indexBy: 'id' } as any)

      await spaceStore.load()

      const followSpaceStore: FollowSpaceStore = await orbitdb.docs('follow_spaces', { indexBy: 'spaceId' } as any)

      await followSpaceStore.load()

      setState({ spaceStore, followSpaceStore, nextSpaceId })

      if (window) {
        (window as any).followSpaceStore = followSpaceStore;
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
