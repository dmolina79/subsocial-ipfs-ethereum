import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { encode as utf8ToBytes, decode as bytesToUtf8 } from '@stablelib/utf8'
import { encode as bytesToHex, decode as hexToBytes } from '@stablelib/hex'
import { encodeURLSafe as bytesToBase64, decodeURLSafe as base64ToBytes } from '@stablelib/base64'
import nacl from 'tweetnacl'

// See https://nextjs.org/docs/api-routes/introduction

const secret = nacl.randomBytes(nacl.secretbox.keyLength)
const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
const message = utf8ToBytes('Привет, Мир! Как ты?')
const encryptedMessage = nacl.secretbox(message, nonce, secret)

async function storeSecret(req: NextApiRequest, res: NextApiResponse) {
  // TODO save a secret to file with a name of public key of a writer.
  // const { author, postId, encryptedSecret } = req.query
  // fs.
  res.status(200).json({})
}

async function getSecret(req: NextApiRequest, res: NextApiResponse) {
  // console.log(req)

  const keys = nacl.box.keyPair()
  const boxPublicKey = bytesToBase64(keys.publicKey)
  const boxSecretKey = bytesToBase64(keys.secretKey)

  res.status(200).json({
    boxPublicKey,
    boxSecretKey,
    secret: bytesToBase64(secret),
    nonce: bytesToBase64(nonce),
    encryptedMessageAsHex: bytesToHex(encryptedMessage),
    encryptedMessageAsBase64: bytesToBase64(encryptedMessage)
  })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    return storeSecret(req, res)
  } else if (req.method === 'GET') {
    return getSecret(req, res)
  }
  res.status(404).json({})
}