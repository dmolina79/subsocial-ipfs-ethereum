import Web3 from 'web3'
import { ETH_NODE_HOST, ETH_NODE_PORT } from '../../../components/eth/conf'
import CreaditJson from "../../../contracts/Creadit.json"

const nodeUrl = `http://${ETH_NODE_HOST}:${ETH_NODE_PORT}`
const provider = new Web3.providers.HttpProvider(nodeUrl)
export const web3 = new Web3(provider)
export const CreaditAddress = CreaditJson.networks[5777].address
export const CreaditContract = new web3.eth.Contract(CreaditJson.abi as any, CreaditAddress)
