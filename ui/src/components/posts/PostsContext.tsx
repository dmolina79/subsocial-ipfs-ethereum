import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext, openStore, openIdCounter } from '../orbitdb';
import { useRouter } from 'next/router';
import { Loading, createPostLink } from '../utils';
import { PostLinks } from '../spaces/types';

export type PostStore = DocStore<PostDto>

type PostStoreContextType = {
  nextPostId?: CounterStore,
  postStore: PostStore,
  postsPath: string
}

type PostProviderProps = {
  links: PostLinks
}

export const PostStoreContext = createContext<PostStoreContextType>({ 
  nextPostId: {} as any,
  postStore: {} as any,
  postsPath: ''
});

export const usePostStoreContext = () =>
  useContext(PostStoreContext)

export const PostStoreProvider = ({ links, children }: React.PropsWithChildren<PostProviderProps>) => {
  const [ state, setState ] = useState<PostStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {

    let nextPostId: CounterStore;
    let postStore: PostStore;
    async function init() {
      if (!links) return

      console.log('Before init post counter')
      if (links.postIdCounter) {
        nextPostId = await openIdCounter(orbitdb, links.postIdCounter)

        await nextPostId.load()
      }
      console.log('After init post counter')

      postStore = await openStore<PostStore>(orbitdb, links.postStore)

      await postStore.load()

      console.log('Succes connect to post store by link: ', links.postStore)

      setState({ postStore, nextPostId, postsPath: (postStore as any).id })

    }
    init()

    return () => { 
      nextPostId && nextPostId.close()
      postStore && postStore.close()
     }
  }, [ links ])

  return state
    ? <PostStoreContext.Provider
        value={state}>
          {children}
      </PostStoreContext.Provider>
    : <Loading label='Initialization post context'/>
  }

export const PostStoreProviderWithLinks = ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { query } = useRouter()

  return <PostStoreProvider links={{ postStore: createPostLink(query as any) }}>{children}</PostStoreProvider>
}
