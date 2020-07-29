import React, { useContext, createContext, useState, useEffect } from 'react';

import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { useOrbitDbContext } from '../orbitdb';

type PostStore = DocStore<PostDto>

type PostStoreContextType = {
  nextPostId: CounterStore,
  postStore: PostStore,
}

export const PostStoreContext = createContext<PostStoreContextType>({ 
  nextPostId: {} as any,
  postStore: {} as any, 
});

export const usePostStoreContext = () =>
  useContext(PostStoreContext)

export const PostStoreProvider = (props: React.PropsWithChildren<{}>) => {
  const [ state, setState ] = useState<PostStoreContextType>()
  const { orbitdb } = useOrbitDbContext()

  useEffect(() => {
    async function init() {
      // const db = await orbitdb.log('hello2') // this works!
      // console.log(orbitdb)
      const nextPostId = await orbitdb.open('next_post_id', {
        create: true,
        type: 'counter',
        replicate: true
        // overwrite (boolean): Overwrite an existing database (Default: false)
        // replicate (boolean): Replicate the database with peers, requires IPFS PubSub. (Default: true)
      }) as CounterStore

      await nextPostId.load()

      const postStore: PostStore = await orbitdb.docs('posts', { indexBy: 'id' } as any)

      await postStore.load()

      setState({ postStore, nextPostId })
      // const peerId = ''
      // await db.access.grant('write', id2)

      // const nextPostId = await orbitdb.create('post_total_counter', 'counter', {
      //   accessController: {
      //     write: [
      //       '*' // Anyone can write
      //       // Give access to ourselves
      //       // orbitdb.identity.id,
      //       // Give access to the second peer
      //       // peerId
      //     ]
      //   },
      //   // overwrite: true,
      //   // replicate: false,
      //   // meta: { hello: 'meta hello' }
      // }) as CounterStore
      // database is now ready to be queried

      if (window) {
        (window as any).postStore = postStore;
        (window as any).nextPostId = nextPostId;
      }
    }
    init()
  }, [ false ])

  return state
    ? <PostStoreContext.Provider
        value={state}>
          {props.children}
      </PostStoreContext.Provider>
    : null
  }

export default PostStoreProvider


// export const getPostStore = async () => {
//   if (postStore) return postStore;

//   if (!orbitdb) {
//     orbitdb = await OrbitDB.createInstance(ipfs)
//   }

//   postStore = await orbitdb.docs('posts', { indexBy: 'id' } as any)

//   await postStore.load()

//   return postStore;
// }