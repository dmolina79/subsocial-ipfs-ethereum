import React, { useContext, createContext, useState, useEffect } from 'react';

import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { FollowSpace } from './types';
import { Loading } from '../utils';
// import { orbitConst } from '../orbitdb/orbitConn';W
import { useRouter } from 'next/router';

export type FollowSpaceStore = DocStore<FollowSpace>

type FollowSpaceStoreContextType = {
  followSpaceStore: FollowSpaceStore,
}

export const FollowSpaceStoreContext = createContext<FollowSpaceStoreContextType>({ 
  followSpaceStore: {} as any
});

export const useFollowSpaceStoreContext = () =>
  useContext(FollowSpaceStoreContext)

export const FollowSpaceStoreProvider = (props: React.PropsWithChildren<{}>) => {
  const [ state, setState ] = useState<FollowSpaceStoreContextType>()
  const { orbitdb } = useOrbitDbContext()



  useEffect(() => {
    let followSpaceStore: FollowSpaceStore;

    async function init() {

      followSpaceStore = await orbitdb.docs('follow_spaces', { indexBy: 'spacePath' } as any)

      await followSpaceStore.load()

      setState({ followSpaceStore })

    }
    init()

    return () => {
      followSpaceStore.close()
    }
  }, [ false ])

  return state
    ? <FollowSpaceStoreContext.Provider
        value={state}>
          {props.children}
      </FollowSpaceStoreContext.Provider>
    : <Loading label='Initialization follow space context'/>
  }

const FollowSpaceStoreWrapper =  ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { query: { postId } } = useRouter()

  if (postId) return <>{children}</>;

  return <FollowSpaceStoreProvider>{children}</FollowSpaceStoreProvider>
}

export default FollowSpaceStoreWrapper