import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { SpaceDto } from './types';
import { Loading } from '../utils';
import { useRouter } from 'next/router';

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

export const SpaceStoreProvider = ({ spaceStoreLink, children }: React.PropsWithChildren<{ spaceStoreLink: string }>) => {
  const [ state, setState ] = useState<SpaceStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {
    let nextSpaceId: CounterStore;
    let spaceStore: SpaceStore;
    async function init() {

      console.log('Before init space counter')
      nextSpaceId = await orbitdb.open('next_space_id', {
        create: true,
        type: 'counter'
      }) as CounterStore

      await nextSpaceId.load()

      console.log('After init space counter')

      spaceStore = await orbitdb.docs(spaceStoreLink, { indexBy: 'path' } as any)

      await spaceStore.load()

      setState({ spaceStore, nextSpaceId, spacesPath: (spaceStore as any).id });
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
  const { pathname, query } = useRouter()

  if (query.postId || !pathname.includes('spaces')) return <>{children}</>;

  return <SpaceStoreProvider spaceStoreLink={'spaces'}>{children}</SpaceStoreProvider>
}

export default SpaceStoreWrapper
