import React, { useContext, createContext, useState, useEffect } from 'react';

const IpfsClient = require('ipfs-http-client')
import OrbitDB from 'orbit-db'
import CounterStore from 'orbit-db-counterstore'
import DocStore from 'orbit-db-docstore'
import { PostDto } from '../posts/types';
import { HomeOutlined } from '@ant-design/icons';
import { PageHeader, Tag } from 'antd';
import { useRouter } from 'next/router';

const ipfs = IpfsClient('/ip4/127.0.0.1/tcp/5001')

let orbitdb: OrbitDB | undefined = undefined
let postStore: PostStore | undefined = undefined;

type PostStore = DocStore<PostDto>

type OrbitDb = {
  orbitdb: OrbitDB,
  nextPostId: CounterStore,
  postStore: PostStore,
  owner: string
}

export const OrbitDbContext = createContext<OrbitDb>({ 
  orbitdb: {} as any,
  nextPostId: {} as any,
  postStore: {} as any,
  owner: '' 
});

export const useOrbitDbContext = () =>
  useContext(OrbitDbContext)

export const OrbitDbProvider = (props: React.PropsWithChildren<{}>) => {
  const [ orbit, setOrbit ] = useState<OrbitDb>()
  const router = useRouter()

  useEffect(() => {
    async function initOrbitDB() {
      // Oleh's pub key: 
      // 3044022022b77f26a744e429c0ae88c66215038190a5114d2e05e44b96af72b77bc43a4b02206d73182b74d40e11690af11afe95d0fa372287b13d754c92ff98c7254eaf6890

      // Oleh's id:
      // 03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b

      orbitdb = await OrbitDB.createInstance(ipfs)
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

      setOrbit({ orbitdb, nextPostId: nextPostId, postStore, owner: (orbitdb as any).identity.id })
      if (window) {
        (window as any).orbitdb = orbitdb;
        (window as any).postStore = postStore;
        (window as any).nextPostId = nextPostId;
        // console.log('HINT: See window.orbitdb and window.db')
      }
    }
    initOrbitDB()
  }, [ false ])

  const status = orbit
    ? <Tag color="green">READY</Tag>
    : <Tag color="red">Connecting...</Tag>

  return <>
    <PageHeader
      title='OrbitDB'
      style={{ borderBottom: '1px solid #ddd' }}
      subTitle={status}
      onBack={() => router.push('/')}
      backIcon={<HomeOutlined />}
    />
    <div className='PageContent'>
      {orbit && <OrbitDbContext.Provider value={orbit}>
        {props.children}
      </OrbitDbContext.Provider>}
    </div>
  </>
}

export const getPostStore = async () => {
  if (postStore) return postStore;

  if (!orbitdb) {
    orbitdb = await OrbitDB.createInstance(ipfs)
  }

  postStore = await orbitdb.docs('posts', { indexBy: 'id' } as any)

  await postStore.load()

  return postStore;
}

export default OrbitDbProvider
