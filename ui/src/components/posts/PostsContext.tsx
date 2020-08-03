import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext } from '../orbitdb';
import { useRouter } from 'next/router';
import OrbitDB from 'orbit-db';
import { Loading } from '../utils';
import { PostLinks, SpaceDto } from '../spaces/types';

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

export const openPostIdCounter = (orbitdb: OrbitDB, postsPath: string) => orbitdb.open(postsPath, {
  type: 'counter',
}) as Promise<CounterStore>

export const openPostStore = async (orbitdb: OrbitDB, postsPath: string) => await orbitdb.open(postsPath, {
  type: 'docstore',
  indexBy: 'id'
} as any) as PostStore


export const PostStoreContext = createContext<PostStoreContextType>({ 
  nextPostId: {} as any,
  postStore: {} as any,
  postsPath: '',
  isReady: false,
  setLinksFromSpace: {} as any
});

export const usePostStoreContext = () =>
  useContext(PostStoreContext)

export const PostStoreProvider = ({ postStoreLink, children }: React.PropsWithChildren<PostProviderProps>) => {
  const [ state, setState ] = useState<PostStoreStateType>({ isReady: false } as any)
  const [ links, setLinks ] = useState<PostLinks>({ postStore: postStoreLink } as any)
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {

    let nextPostId: CounterStore;
    let postStore: PostStore;
    async function init() {
      if (!links) return

      console.log('Before init post counter')
      if (links.postIdCounter) {
        nextPostId = await openPostIdCounter(orbitdb, links.postIdCounter)

        await nextPostId.load()
      }
      console.log('After init post counter')

      postStore = await openPostStore(orbitdb, links.postStore)

      await postStore.load()

      console.log('After init post counter')

      setState({ postStore, nextPostId, postsPath: (postStore as any).id, isReady: true })

    }
    init()

    return () => { 
      nextPostId.close()
      postStore.close()
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
  const { query: { spaceId }, asPath } = useRouter()

  if (!spaceId) return <>{children}</>;

  console.log(asPath.substr(0, asPath.length - 2))
  return <PostStoreProvider postStoreLink={asPath.substr(0, asPath.length - 2)}>{children}</PostStoreProvider>
}

export default PostStoreProviderWithSpaceId