import Web3 from "web3"
import { IDrizzleOptions } from "@drizzle/store"
import { IContract } from "@drizzle/store/types/IContract"
import ComplexStorage from "../../contracts/ComplexStorage.json"
import SimpleStorage from "../../contracts/SimpleStorage.json"
import TutorialToken from "../../contracts/TutorialToken.json"

console.log({ ComplexStorage, SimpleStorage, TutorialToken })

const contracts: IContract[] =[
  SimpleStorage,
  ComplexStorage,
  TutorialToken
] as unknown as IContract[]

const options: IDrizzleOptions = {
  web3: {
    // block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts,
  events: {
    SimpleStorage: ["StorageSet"],
  }
}

export default options
