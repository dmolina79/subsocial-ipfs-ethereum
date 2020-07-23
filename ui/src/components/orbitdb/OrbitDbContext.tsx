import React, { useContext, createContext, useState, useEffect } from 'react';

const IpfsClient = require('ipfs-http-client')
const OrbitDB = require('orbit-db')

const ipfs = IpfsClient('/ip4/127.0.0.1/tcp/5001')

type OrbitDb = {
  orbitdb: any,
  db: any,
  owner: string
}

export const OrbitDbContext = createContext<OrbitDb>({ orbitdb: {}, db: {}, owner: '' });

export const useOrbitDbContext = () =>
  useContext(OrbitDbContext)

export const OrbitDbProvider = (props: React.PropsWithChildren<{}>) => {
  const [ orbit, setOrbit ] = useState<OrbitDb>()

  useEffect(() => {
    async function initOrbitDB() {
      // Oleh's pub key: 
      // 3044022022b77f26a744e429c0ae88c66215038190a5114d2e05e44b96af72b77bc43a4b02206d73182b74d40e11690af11afe95d0fa372287b13d754c92ff98c7254eaf6890

      // Oleh's id:
      // 03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b

      const orbitdb = await OrbitDB.createInstance(ipfs)
      // const db = await orbitdb.log('hello2') // this works!
      // console.log(orbitdb)
      const orbitdbAddress = '/orbitdb/zdpuAv7x7gZ57NW6vDi1nHU16UbfR42URTZbcgxb1X5XP4o4N/user.comments.4'
      const db = await orbitdb.open(orbitdbAddress, {
        // create: true,
        type: 'feed',
        replicate: true
        // overwrite (boolean): Overwrite an existing database (Default: false)
        // replicate (boolean): Replicate the database with peers, requires IPFS PubSub. (Default: true)
      })

      // const peerId = ''
      // await db.access.grant('write', id2)

      // const db = await orbitdb.create('user.comments.3', 'feed', {
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
      // })
      await db.load()
      // database is now ready to be queried

      setOrbit({ orbitdb, db, owner: orbitdb.identity.id })
      if (window) {
        (window as any).orbitdb = orbitdb;
        (window as any).db = db;
        // console.log('HINT: See window.orbitdb and window.db')
      }
    }
    initOrbitDB()
  }, [ false ])

  const status = orbit
    ? <b style={{ color: 'green' }}>READY</b>
    : <em style={{ color: 'red' }}>Connecting...</em>

  return <>
    <div>OrbitDB: {status}</div>
    {orbit && <OrbitDbContext.Provider value={orbit}>
      {props.children}
    </OrbitDbContext.Provider>}
  </>
}

export default OrbitDbProvider