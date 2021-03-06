import Web3 from "web3"
import { Drizzle, IDrizzleOptions } from "@drizzle/store"
import { IContract } from "@drizzle/store/types/IContract"
import { ETH_NODE_HOST, ETH_NODE_PORT } from './conf'
import Creadit from "../../contracts/Creadit.json"
import ComplexStorage from "../../contracts/ComplexStorage.json"
import SimpleStorage from "../../contracts/SimpleStorage.json"
import TutorialToken from "../../contracts/TutorialToken.json"

// console.log({ Creadit, TutorialToken })

const contracts: IContract[] =[
  Creadit,
  SimpleStorage,
  ComplexStorage,
  TutorialToken
] as unknown as IContract[]

const options: IDrizzleOptions = {
  web3: {
    // block: false,
    customProvider: new Web3(`ws://${ETH_NODE_HOST}:${ETH_NODE_PORT}`)
  },
  contracts,
  events: {
    Creadit: ["PaidForPost", "ChangedSpaceHandle"],
    SimpleStorage: ["StorageSet"],
  }
}

export const drizzle = new Drizzle(options)
