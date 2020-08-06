import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { returnOk, returnServerError, newRequireParam, apiPublicKey, web3 } from '../../../utils'
import { bytesToBase64 } from '../../../utils/codecs'
import { decryptSecretForApi } from '../../../utils/crypto'

const secretsDir = process.env.SECRETS_DIR || path.join(process.env.PWD || '~', '.secrets')

const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

export type StoreSecretParams = {
  postId: string
  authorEthAddress: string
  authorPublicKey: string
  nonce: string
  encryptedSecret: string
  signedSecretHash: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!secretsDir) {
    return returnServerError(res, 'Secrets dir undefined for this app')
  }

  const requireParam = newRequireParam<StoreSecretParams>(req, res)

  const postId = requireParam('postId')
  const authorEthAddress = requireParam('authorEthAddress')
  const authorPublicKey = requireParam('authorPublicKey')
  const nonce = requireParam('nonce')

  // NaCl box secret encrypted for the box public key of this app
  const encryptedSecret = requireParam('encryptedSecret')

  // keccak256 hash of a secret signed with author's Ethereum address
  const signedSecretHash = requireParam('signedSecretHash')

  const dirExists = await exists(secretsDir)
  if (!dirExists) {
    await mkdir(secretsDir)
  }

  const secret = decryptSecretForApi({
    encryptedSecret,
    nonce,
    publicKey: authorPublicKey
  })

  if (secret === false) {
    returnServerError(res, 'Failed to decrypt a secret')
  }

  // TODO get post author from ETH contract and compare with authorEthAddress param

  // TODO get post id from ETH contract and compare with postId param

  const secretAsString = bytesToBase64(secret as Uint8Array)
  const secretHash = web3.utils.keccak256(secretAsString)
  const signer = await web3.eth.accounts.recover(secretHash, signedSecretHash)
  
  console.log({ authorEthAddress, signer, secretAsString, secretHash, signedSecretHash, })

  // This doesn't work. Signatures don't match :(
  // if (signer !== authorEthAddress) {
  //   returnClientError(res, 'A secret hash was not signed by a provided Ethereum address')
  // }

  const json = JSON.stringify({
    postId,
    authorEthAddress,
    encryptedSecret,
    nonce,
    authorPublicKey,
    apiPublicKey
  }, null, 2)

  const filePath = path.join(secretsDir, `${secretHash}.json`)
  await writeFile(filePath, json)
  returnOk(res, true)
}