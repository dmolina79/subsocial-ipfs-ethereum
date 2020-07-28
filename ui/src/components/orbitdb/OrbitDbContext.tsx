import React, { useContext, createContext, useState, useEffect } from 'react';

const IpfsClient = require('ipfs-http-client')
import OrbitDB from 'orbit-db'
import { HomeOutlined } from '@ant-design/icons';
import { PageHeader, Tag } from 'antd';
import { useRouter } from 'next/router';

const ipfs = IpfsClient('/ip4/127.0.0.1/tcp/5001')

let orbitdb: OrbitDB | undefined = undefined

type OrbitDb = {
  orbitdb: OrbitDB,
  owner: string
}

export const OrbitDbContext = createContext<OrbitDb>({ 
  orbitdb: {} as any,
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

      setOrbit({ orbitdb, owner: (orbitdb as any).identity.id })
      if (window) {
        (window as any).orbitdb = orbitdb;
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

export default OrbitDbProvider


// export const getPostStore = async () => {
//   if (postStore) return postStore;

//   if (!orbitdb) {
//     orbitdb = await OrbitDB.createInstance(ipfs)
//   }

//   postStore = await orbitdb.docs('posts', { indexBy: 'id' } as any)

//   await postStore.load()

//   return postStore;
// }