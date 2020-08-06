import React, { useContext, createContext, useState, useEffect } from 'react';
import CounterStore from 'orbit-db-counterstore';
import { SpaceStore } from '../spaces/SpaceContext';
import { CommentStore } from '../comments/СommentContext';
import { PostStore } from '../posts/PostsContext';
import OrbitDB from 'orbit-db'

const IPFS = require('ipfs')

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

      const ipfs = await IPFS.create({
        repo: '/orbitdb/hackfs/test1',
        start: true,
        // preload: {
        //   enabled: false
        // },
        EXPERIMENTAL: {
          ipnsPubsub: true,
        },
        config: {
          Addresses: {
            Swarm: [
              '/ip4/127.0.0.1/tcp/9090/ws/p2p-webrtc-star/',
            ]
          },
        }
      })
    
      orbitdb = await OrbitDB.createInstance(ipfs)

      setOrbit({ orbitdb, owner: (orbitdb as any).identity.id, isReady: true })
      if (window) {
        (window as any).orbitdb = orbitdb;
        (window as any).ipfs = ipfs
      }
    }
    initOrbitDB()
  }, [ false ])

  return <OrbitDbContext.Provider value={orbit}>
      {props.children}
    </OrbitDbContext.Provider>
}

export default OrbitDbProvider

export const openIdCounter = async (orbitdb: OrbitDB, path: string) => await orbitdb.open(path, {
  create: true,
  type: 'counter',
  replicate: true,
  accessController: {
    write: '*',
  }
} as any) as CounterStore

export const openStore = async <T extends PostStore | SpaceStore | CommentStore>(orbitdb: OrbitDB, path: string) => await orbitdb.open(path, {
  create: true,
  type: 'docstore',
  replicate: true,
  accessController: {
    write: '*',
  },
  indexBy: 'path'
} as any) as T