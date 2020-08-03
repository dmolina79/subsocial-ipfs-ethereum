import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext, openStore, openIdCounter } from '../orbitdb';
import { useRouter } from 'next/router';
import { Loading, createPostLink } from '../utils';
import { PostLinks, SpaceDto } from '../spaces/types';
import OrbitDB from 'orbit-db';

export type PostStore = DocStore<PostDto>

type PostStoreStateType = {
  nextPostId?: CounterStore,
  postStore: PostStore,
  postsPath: string,
  isReady: boolean
}

type PostStoreContextType = PostStoreStateType & {
  setLinksFromSpace: (space: SpaceDto) => void
}

type PostProviderProps = {
  postStoreLink: string
}

export const PostStoreContext = createContext<PostStoreContextType>({ 
  nextPostId: {} as any,
  postStore: {} as any,
  postsPath: '',
  isReady: false,
  setLinksFromSpace: {} as any
});

export const createPostIdCounter = async (orbitdb: OrbitDB, spaceId: string) => await orbitdb.create(`spaces/${spaceId}/next_post_id`, 'counter', {
  accessController: {
    write: [
      '*' // Anyone can write
      // Give access to ourselves
      // orbitdb.identity.id,
      // Give access to the second peer
      // peerId
    ]
  },
}) as CounterStore

export const createPostStore = async (orbitdb: OrbitDB, spaceId: string) => await orbitdb.create(`spaces/${spaceId}/posts`, 'docstore', {
  accessController: {
    write: [
      '*' // Anyone can write
      // Give access to ourselves
      // orbitdb.identity.id,
      // Give access to the second peer
      // peerId
    ]
  },
}) as PostStore

export const usePostStoreContext = () =>
  useContext(PostStoreContext)

export const PostStoreProvider = ({ postStoreLink, children }: React.PropsWithChildren<PostProviderProps>) => {
  const [ state, setState ] = useState<PostStoreStateType>({ isReady: false } as any)
  const [ links, setLinks ] = useState<PostLinks>({ postStore: postStoreLink } as any)
  const { orbitdb } = useOrbitDbContext()

  console.log(links)

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

      console.log('After init post counter')

      setState({ postStore, nextPostId, postsPath: (postStore as any).id, isReady: true })

    }
    init()

    return () => { 
      nextPostId && nextPostId.close()
      postStore && postStore.close()
     }
  }, [ links ])

  return state
    ? <PostStoreContext.Provider
        value={{
          ...state,
          setLinksFromSpace: ({ links }: SpaceDto) => setLinks({ ...links })
        }}>
          {children}
      </PostStoreContext.Provider>
    : <Loading label='Initialization post context'/>
  }

const PostStoreProviderWithSpaceId = ({ children }: React.PropsWithChildren<{}>): JSX.Element | null => {
  const { query } = useRouter()

  if (!query.spaceId) return <>{children}</>;

  return <PostStoreProvider postStoreLink={createPostLink(query as any)}>{children}</PostStoreProvider>
}

export default PostStoreProviderWithSpaceId