import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext } from '../orbitdb';
import { useRouter } from 'next/router';
import OrbitDB from 'orbit-db';
import { Loading } from '../utils';

export type PostStore = DocStore<PostDto>

type PostStoreContextType = {
  nextPostId: CounterStore,
  postStore: PostStore,
}

type PostProviderProps = {
  spaceId: string
}

export const getPostStoreAddress = (spaceId: string) => `spaces/${spaceId}/posts`
export const getPostIdCounterAddress = (spaceId: string) => `spaces/${spaceId}/next_post_id`

export const openPostIdCounter = (orbitdb: OrbitDB, spaceId: string) => orbitdb.open(getPostIdCounterAddress(spaceId), {
  create: true,
  type: 'counter',
  replicate: true
}) as Promise<CounterStore>

export const openPostStore = (orbitdb: OrbitDB, spaceId: string): Promise<PostStore> => orbitdb.docs(getPostStoreAddress(spaceId), { indexBy: 'id' } as any ) as any

export const PostStoreContext = createContext<PostStoreContextType>({ 
  nextPostId: {} as any,
  postStore: {} as any, 
});

export const usePostStoreContext = () =>
  useContext(PostStoreContext)

export const PostStoreProvider = ({ spaceId, children }: React.PropsWithChildren<PostProviderProps>) => {
  const [ state, setState ] = useState<PostStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {
    let nextPostId: CounterStore;
    let postStore: PostStore;
    async function init() {

      console.log('Before init post counter')
      nextPostId = await orbitdb.open(getPostIdCounterAddress(spaceId), {
        create: true,
        type: 'counter'
      }) as CounterStore

      await nextPostId.load()
      console.log('After init post counter')

      postStore = await openPostStore(orbitdb, spaceId)

      await postStore.load()

      console.log('After init post counter')

      setState({ postStore, nextPostId })

    }
    init()

    return () => { 
      nextPostId.close()
      postStore.close()
     }
  }, [ spaceId ])

  return state
    ? <PostStoreContext.Provider
        value={state}>
          {children}
      </PostStoreContext.Provider>
    : <Loading label='Initialization post context'/>
  }

const PostStoreProviderWithSpaceId = ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { spaceId } = useRouter().query

  if (!spaceId) return <>{children}</>;

  return <PostStoreProvider spaceId={spaceId as string}>{children}</PostStoreProvider>
}

export default PostStoreProviderWithSpaceId