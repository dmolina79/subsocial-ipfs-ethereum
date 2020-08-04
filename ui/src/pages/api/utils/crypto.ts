import nacl from 'tweetnacl'
import { base64ToBytes, bytesToBase64, utf8ToBytes } from '../utils/codecs'

// TODO throw error if not defined
const apiSecretKey = process.env.BOX_SECRET_KEY_BASE64 as string

type EncryptSecretProps = {
  secret: Uint8Array
  publicKey: string
}

export const encryptSecret = (props: EncryptSecretProps) => {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const encryptedSecret = nacl.box(
    props.secret,
    nonce,
    base64ToBytes(props.publicKey),
    base64ToBytes(apiSecretKey)
  )
  return {
    encryptedSecret: bytesToBase64(encryptedSecret),
    nonce: bytesToBase64(nonce)
  }
}

type DecryptSecretProps = {
  encryptedSecret: string
  nonce: string
  publicKey: string
}

export const decryptSecret = (props: DecryptSecretProps) => {
  return nacl.box.open(
    base64ToBytes(props.encryptedSecret),
    base64ToBytes(props.nonce),
    base64ToBytes(props.publicKey),
    base64ToBytes(apiSecretKey)
  )
}

type EncryptContentProps = {
  content: Uint8Array
}

export const encryptContent = (props: EncryptContentProps) => {
  const secret = nacl.randomBytes(nacl.secretbox.keyLength)
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const encryptedContent = nacl.secretbox(
    props.content,
    nonce,
    secret
  )
  return {
    encryptedContent: bytesToBase64(encryptedContent),

    // TODO continue...
    // encryptedSecret: bytesToBase64(encryptedSecret),

    nonce: bytesToBase64(nonce)
  }
}