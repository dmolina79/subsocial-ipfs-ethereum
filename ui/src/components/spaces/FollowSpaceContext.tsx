import React, { useContext, createContext, useState, useEffect } from 'react';

import DocStore from 'orbit-db-docstore'
import { useOrbitDbContext } from '../orbitdb';
import { FollowSpace } from './types';
import { Loading } from '../utils';
import { orbitConst } from '../orbitdb/orbitConn';
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

  const closeConn = async () => {
    const {
      followSpaceStore,
    } = orbitConst
  
    if (followSpaceStore) {
      await followSpaceStore.close();
      orbitConst.followSpaceStore = undefined
    }
  }

  useEffect(() => {
    async function init() {

      const followSpaceStore: FollowSpaceStore = await orbitdb.docs('follow_spaces', { indexBy: 'spaceId' } as any)

      await followSpaceStore.load()

      setState({ followSpaceStore })

      orbitConst.followSpaceStore = followSpaceStore;
    }
    init()

    return () => {
      closeConn()
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