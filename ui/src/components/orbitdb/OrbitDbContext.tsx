import React, { useContext, createContext, useState, useEffect } from 'react';

const IpfsClient = require('ipfs-http-client')
import OrbitDB from 'orbit-db'
import { orbitConst } from './orbitConn';
import CounterStore from 'orbit-db-counterstore';
import { SpaceStore } from '../spaces/SpaceContext';
import { CommentStore } from '../comments/СommentContext';
import { PostStore } from '../posts/PostsContext';

const ipfs = IpfsClient('/ip4/127.0.0.1/tcp/5001')

let orbitdb: OrbitDB | undefined = undefined

type OrbitDb = {
  orbitdb: OrbitDB,
  owner: string,
  isReady: boolean
}

const initialState = { 
  orbitdb: {} as any,
  owner: '',
  isReady: false
}

export const OrbitDbContext = createContext<OrbitDb>(initialState);

export const useOrbitDbContext = () =>
  useContext(OrbitDbContext)

export const OrbitDbProvider = (props: React.PropsWithChildren<{}>) => {
  const [ orbit, setOrbit ] = useState<OrbitDb>(initialState)

  useEffect(() => {
    async function initOrbitDB() {
      // Oleh's pub key: 
      // 3044022022b77f26a744e429c0ae88c66215038190a5114d2e05e44b96af72b77bc43a4b02206d73182b74d40e11690af11afe95d0fa372287b13d754c92ff98c7254eaf6890

      // Oleh's id:
      // 03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b

      orbitdb = await OrbitDB.createInstance(ipfs)

      setOrbit({ orbitdb, owner: (orbitdb as any).identity.id, isReady: true })
      if (window) {
        orbitConst.orbitDb = orbitdb;
        (window as any).orbitConst = orbitConst;
      }
    }
    initOrbitDB()
  }, [ false ])

  return <OrbitDbContext.Provider value={orbit}>
      {props.children}
    </OrbitDbContext.Provider>
}

export default OrbitDbProvider

export const openIdCounter = async (orbitdb: OrbitDB, path: string) => await orbitdb.counter(path) as CounterStore

export const openStore = async <T extends PostStore | SpaceStore | CommentStore>(orbitdb: OrbitDB, path: string) => await orbitdb.docs(path, { indexBy: 'path' } as any) as T

// export const getPostStore = async () => {
//   if (postStore) return postStore;

//   if (!orbitdb) {
//     orbitdb = await OrbitDB.createInstance(ipfs)
//   }

//   postStore = await orbitdb.docs('posts', { indexBy: 'id' } as any)

//   await postStore.load()

//   return postStore;
// }

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

      