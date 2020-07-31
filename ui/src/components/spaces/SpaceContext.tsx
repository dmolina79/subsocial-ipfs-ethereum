import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { SpaceDto } from './types';
import { Loading } from '../utils';
import { orbitConst } from '../orbitdb/orbitConn';
import { useRouter } from 'next/router';

export type SpaceStore = DocStore<SpaceDto>

type SpaceStoreContextType = {
  nextSpaceId: CounterStore,
  spaceStore: SpaceStore
}

export const SpaceStoreContext = createContext<SpaceStoreContextType>({ 
  nextSpaceId: {} as any,
  spaceStore: {} as any
});

export const useSpaceStoreContext = () =>
  useContext(SpaceStoreContext)

export const SpaceStoreProvider = (props: React.PropsWithChildren<{}>) => {
  const [ state, setState ] = useState<SpaceStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  const closeConn = async () => {
    const {
      spaceStore,
      nextSpaceId,
    } = orbitConst

    if (spaceStore) {
      await spaceStore.close();
      orbitConst.spaceStore = undefined
    }
    if (nextSpaceId) {
      await nextSpaceId.close();
      orbitConst.nextSpaceId = undefined
    }
  }

  useEffect(() => {
    async function init() {

      console.log('Before init space counter')
      const nextSpaceId = await orbitdb.open('next_space_id', {
        create: true,
        type: 'counter'
      }) as CounterStore

      await nextSpaceId.load()

      console.log('After init space counter')

      const spaceStore: SpaceStore = await orbitdb.docs('spaces', { indexBy: 'id' } as any)

      await spaceStore.load()

      setState({ spaceStore, nextSpaceId });

      orbitConst.spaceStore = spaceStore;
      orbitConst.nextSpaceId = nextSpaceId;
    }
    init()

    return () => {
      closeConn()
    }
  }, [ false ])

  return state
    ? <SpaceStoreContext.Provider
        value={state}>
          {props.children}
      </SpaceStoreContext.Provider>
    : <Loading label='Initialization space context'/>
  }


const SpaceStoreWrapper = ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { query: { postId }, pathname } = useRouter()

  if (postId || !pathname.includes('spaces')) return <>{children}</>;

  return <SpaceStoreProvider>{children}</SpaceStoreProvider>
}

export default SpaceStoreWrapper
