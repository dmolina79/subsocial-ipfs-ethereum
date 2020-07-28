import React, { useContext, createContext, useState, useEffect } from 'react';
import { Buckets, KeyInfo } from '@textile/hub'
import { Libp2pCryptoIdentity } from '@textile/threads-core';

type BucketContextType = {
  buckets: Buckets,
  bucketKey: string,
  rootPath: string
}

export const BucketContext = createContext<BucketContextType>({ 
  buckets: {} as any,
  bucketKey: '',
  rootPath: ''
});

const keyInfo: KeyInfo = {
  key: 'bzk26ksazqot2cfezr5kp7vg7r4',
}

export const useBucketContext = () =>
  useContext(BucketContext)

export const BucketProvider = (props: React.PropsWithChildren<{}>) => {
  const [ buckets, setBuckets ] = useState<Buckets>()
  const [ bucketKey, setBucketKey ] = useState('')
  const [ rootPath, setUrl ] = useState<string>()
  /**
   * getIdentity uses a basic private key identity.
   * The user's identity will be cached client side. This is long
   * but ephemeral storage not sufficient for production apps.
   * 
   * Read more here:
   * https://docs.textile.io/tutorials/hub/libp2p-identities/
   */
  const getIdentity = async (): Promise<Libp2pCryptoIdentity> => {
    try {
      var storedIdent = localStorage.getItem("identity")
      if (storedIdent === null) {
        throw new Error('No identity')
      }
      const restored = Libp2pCryptoIdentity.fromString(storedIdent)
      return restored
    }
    catch (e) {
      /**
       * If any error, create a new identity.
       */
      try {
        const identity = await Libp2pCryptoIdentity.fromRandom()
        const identityString = identity.toString()
        localStorage.setItem("identity", identityString)
        return identity
      } catch (err) {
        return err.message
      }
    }
  }

  /**
   * getBucketKey will create a new Buckets client with the UserAuth
   * and then open our custom bucket named, 'io.textile.dropzone'
   */
  const getBucketKey = async (identity: Libp2pCryptoIdentity) => {
    if (!identity) {
      throw new Error('Identity not set')
    }
    const buckets = await Buckets.withKeyInfo(keyInfo)
    // Authorize the user and your insecure keys with getToken
    await buckets.getToken(identity)

    const root = await buckets.open('io.textile.dropzone')
    if (!root) {
      throw new Error('Failed to open bucket')
    }
    return {buckets: buckets, bucketKey: root.key};
  }

  /**
   * getBucketLinks returns all the protocol endpoints for the bucket.
   * Read more:
   * https://docs.textile.io/hub/buckets/#bucket-protocols 
   */
  const getBucketLinks = async (buckets: Buckets ,bucketKey: string) => {
    if (!buckets) {
      return
    }
    const links = await buckets.links(bucketKey)
    return links
  }

  useEffect(() => {

    const init = async () => {
      const identity = await getIdentity()
      if (identity) {
        const { buckets, bucketKey } = await getBucketKey(identity)

        setBuckets(buckets);
        setBucketKey(bucketKey);

        const links = await getBucketLinks(buckets, bucketKey);
        links && setUrl(links?.url)

      }

    }

    init()
 
  }, [ ])

  const state = rootPath && buckets ? {
    buckets,
    bucketKey,
    rootPath
  } : undefined
  useEffect(() => {

  }, [ false ])

  return state ? <BucketContext.Provider value={state}>
    {props.children}
  </BucketContext.Provider> : null
}

export default BucketProvider


// export const getPostStore = async () => {
//   if (postStore) return postStore;

//   if (!buckets) {
//     buckets = await OrbitDB.createInstance(ipfs)
//   }

//   postStore = await buckets.docs('posts', { indexBy: 'id' } as any)

//   await postStore.load()

//   return postStore;
// }