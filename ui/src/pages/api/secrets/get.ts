import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { returnOk, returnServerError, newRequireParam, returnClientError } from '../../../utils/next'
import { web3 } from '../../../utils/web3'
import { decryptSecretForApi, encryptSecretForBuyer } from '../../../utils/crypto'

const secretsDir = process.env.SECRETS_DIR || path.join(process.env.PWD || '~', '.secrets')

const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)

type GetSecretParams = {
  buyerEthAddress: string
  buyerPublicKey: string
  secretHash: string
  signedSecretHash: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!secretsDir) {
    return returnServerError(res, 'Secrets dir undefined for this app')
  }

  const requireParam = newRequireParam<GetSecretParams>(req, res)

  const buyerEthAddress = requireParam('buyerEthAddress')
  const buyerPublicKey = requireParam('buyerPublicKey')

  const secretHash = requireParam('secretHash')

  // keccak256 hash of a secret signed with buyer's Ethereum address
  const signedSecretHash = requireParam('signedSecretHash')

  const filePath = path.join(secretsDir, `${secretHash}.json`)
  const secretFileFound = await exists(filePath)
  if (!secretFileFound) {
    returnServerError(res, 'Requested secret was not found on the server')
  }

  const {
    postId,
    authorEthAddress,
    encryptedSecret,
    nonce,
    authorPublicKey
  } = JSON.parse(await readFile(filePath, 'utf8'))

  // TODO check that ETH buyer paid for this post in smart contract

  const signer = await web3.eth.accounts.recover(secretHash, signedSecretHash)
  if (signer !== buyerEthAddress) {
    returnClientError(res, 'A secret hash was not signed by a provided Ethereum address')
  }

  const secret = decryptSecretForApi({
    encryptedSecret,
    nonce,
    publicKey: authorPublicKey
  })

  
  if (secret === false) {
    returnServerError(res, 'Failed to decrypt a secret')
  }
  
  const secretEncryptedForBuyer = encryptSecretForBuyer({
    secret: secret as Uint8Array,
    publicKey: buyerPublicKey
  })

  returnOk(res, {
    ...secretEncryptedForBuyer,
    apiPublicKey
  })
}