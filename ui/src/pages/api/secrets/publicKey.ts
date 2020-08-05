import { NextApiRequest, NextApiResponse } from 'next'
import { returnOk, returnServerError } from '../../../utils/next'

const publicKey = process.env.BOX_PUBLIC_KEY_BASE64

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!publicKey) {
    returnServerError(res, 'Box public key is undefined for this app')
  }
  returnOk(res, publicKey)
}