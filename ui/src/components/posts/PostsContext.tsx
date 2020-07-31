import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext } from '../orbitdb';
import { useRouter } from 'next/router';
import OrbitDB from 'orbit-db';

export type PostStore = DocStore<PostDto>

type PostStoreContextType = {
  nextPostId: CounterStore,
  postStore: PostStore,
}

type PostProviderProps = {
  spaceId: string
}

export const getPostStoreAddress = (spaceId: string) => `spaces/${spaceId}/posts`
export const getPostIdCounterAddress = (spaceId: string) => `next_post_id_by_space_${spaceId}`

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
    async function init() {

      console.log('Before init post counter')
      const nextPostId = await orbitdb.open(getPostIdCounterAddress(spaceId), {
        create: true,
        type: 'counter'
      }) as CounterStore

      await nextPostId.load()
      console.log('After init post counter')

      const postStore: PostStore = await openPostStore(orbitdb, spaceId)

      await postStore.load()

      setState({ postStore, nextPostId })

      if (window) {
        (window as any).postStore = postStore;
        (window as any).nextPostId = nextPostId;
      }
    }
    init()

    return () => {
      if (state) {
        state.postStore.close()
        state.nextPostId.close()
      }
    }
  }, [ spaceId ])

  return state
    ? <PostStoreContext.Provider
        value={state}>
          {children}
      </PostStoreContext.Provider>
    : null
  }

const PostStoreProviderWithSpaceId = ({ children }: React.PropsWithChildren<{}>) => {
  const { spaceId } = useRouter().query

  if (!spaceId) return children;

  return <PostStoreProvider spaceId={spaceId as string}>{children}</PostStoreProvider>
}

export default PostStoreProviderWithSpaceId