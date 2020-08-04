import { NextApiRequest, NextApiResponse } from 'next'
import Web3 from 'web3'
import { ETH_NODE_HOST, ETH_NODE_PORT } from '../../components/eth/conf'
import CreaditJson from "../../contracts/Creadit.json"

const nodeUrl = `http://${ETH_NODE_HOST}:${ETH_NODE_PORT}`
const provider = new Web3.providers.HttpProvider(nodeUrl)
const web3 = new Web3(provider)
const CreaditAddress = CreaditJson.networks[5777].address
const CreaditContract = new web3.eth.Contract(CreaditJson.abi as any, CreaditAddress)
const { methods } = CreaditContract

console.log('web3', web3)

// See https://nextjs.org/docs/api-routes/introduction

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // if (req.method === 'POST') ...

  const [
    owner,
    nextSpaceId,
    spaceById,
    paidForPost
  ] = await Promise.all([
    methods.owner().call(),
    methods.nextSpaceId().call(),
    methods.spaceById(1).call(),
    methods.paidForPost('post/1', '0xb447c07024a68538e89623E197184efC603f0f9E').call(),
  ])

  res.status(200).json({
    owner,
    nextSpaceId,
    spaceById,
    paidForPost
  })
}