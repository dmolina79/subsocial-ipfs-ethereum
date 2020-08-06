import nacl from 'tweetnacl'
import { base64ToBytes, bytesToBase64, utf8ToBytes } from './codecs'

// TODO throw error if not defined
export const apiPublicKey = process.env.NEXT_PUBLIC_BOX_PUBLIC_KEY_BASE64 as string

// TODO throw error if not defined
// WARN: Do NOT export this key.
const apiSecretKey = process.env.BOX_SECRET_KEY_BASE64 as string

export const randomNonce = () => {
  return nacl.randomBytes(nacl.secretbox.nonceLength)
}

export const randomSecret = () => {
  return nacl.randomBytes(nacl.secretbox.keyLength)
}

type EncryptSecretProps = {
  secret: string | Uint8Array
  publicKey: string | Uint8Array
}

export const encryptSecretForBuyer = (props: EncryptSecretProps) => {
  const { secret, publicKey }  = props
  const message = typeof secret === 'string' ? base64ToBytes(secret) : secret
  const nonce = randomNonce()
  const pubKey = typeof publicKey === 'string' ? base64ToBytes(publicKey) : publicKey

  const encryptedSecret = nacl.box(
    message,
    nonce,
    pubKey,
    base64ToBytes(apiSecretKey)
  )

  return {
    encryptedSecret: bytesToBase64(encryptedSecret),
    nonce: bytesToBase64(nonce)
  }
}

export const encryptSecretForApi = (secret: string) => {
  const message = typeof secret === 'string' ? base64ToBytes(secret) : secret
  const nonce = randomNonce()
  const keys = nacl.box.keyPair()

  const encryptedSecret = nacl.box(
    message,
    nonce,
    base64ToBytes(apiPublicKey),
    keys.secretKey
  )

  return {
    encryptedSecret: bytesToBase64(encryptedSecret),
    nonce: bytesToBase64(nonce),
    publicKey: bytesToBase64(keys.publicKey)
  }
}

/** All strings should be encoded with URL-safe Base64. */
type DecryptSecretProps = {
  encryptedSecret: string
  nonce: string
  publicKey: string
}

export const decryptSecretForApi = (props: DecryptSecretProps) => {
  return nacl.box.open(
    base64ToBytes(props.encryptedSecret),
    base64ToBytes(props.nonce),
    base64ToBytes(props.publicKey),
    base64ToBytes(apiSecretKey)
  )
}

export const encryptContent = (content: string | Uint8Array) => {
  const message = typeof content === 'string' ? utf8ToBytes(content) : content
  const nonce = randomNonce()
  const secret = randomSecret()

  const encryptedContent = nacl.secretbox(
    message,
    nonce,
    secret
  )

  return {
    encryptedContent: bytesToBase64(encryptedContent),
    secret: bytesToBase64(secret),
    nonce: bytesToBase64(nonce)
  }
}