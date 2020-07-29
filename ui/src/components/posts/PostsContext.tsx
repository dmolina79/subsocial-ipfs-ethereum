import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext } from '../orbitdb';
import { useRouter } from 'next/router';

type PostStore = DocStore<PostDto>

type PostStoreContextType = {
  nextPostId: CounterStore,
  postStore: PostStore,
}

type PostProviderProps = {
  spaceId: string
}

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

      const nextPostId = await orbitdb.open(`next_post_id_by_space_${spaceId}`, {
        create: true,
        type: 'counter',
        replicate: true
      }) as CounterStore

      await nextPostId.load()

      const postStore: PostStore = await orbitdb.docs(`space/${spaceId}/posts`, { indexBy: 'id' } as any)

      await postStore.load()

      setState({ postStore, nextPostId })

      if (window) {
        (window as any).postStore = postStore;
        (window as any).nextPostId = nextPostId;
      }
    }
    init()
  }, [ spaceId ])

  return state
    ? <PostStoreContext.Provider
        value={state}>
          {children}
      </PostStoreContext.Provider>
    : null
  }

export default PostStoreProvider

export const withPostStoreProvider = (Component: React.ComponentType<any>) => {

  return () => {
    const { spaceId } = useRouter().query

    if (!spaceId) return null;

    return <PostStoreProvider spaceId={spaceId as string}><Component spaceId={spaceId} /></PostStoreProvider>
  }
}