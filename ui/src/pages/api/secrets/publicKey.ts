import { NextApiRequest, NextApiResponse } from 'next'
import { returnOk, returnServerError, apiPublicKey } from '../../../utils'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!apiPublicKey) {
    returnServerError(res, 'Box public key is undefined for this app')
  }
  returnOk(res, apiPublicKey)
}