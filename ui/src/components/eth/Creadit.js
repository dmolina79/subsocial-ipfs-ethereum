import React, { useState } from "react";
import { drizzleReactHooks } from '@drizzle/react-plugin'
import { newContextComponents } from "@drizzle/react-components";
import { Loading } from "../utils";

const { useDrizzle, useDrizzleState } = drizzleReactHooks
const { AccountData, ContractData, ContractForm } = newContextComponents;

export default () => {
  const { drizzle } = useDrizzle()
  const drizzleState = useDrizzleState(state => state)
  const initialized = drizzleState.drizzleStatus.initialized
  
  const [ spaceId, setSpaceId ] = useState(1)

  if (!initialized) return <Loading message='Connecting to Ethereum...' />

  const handleSpaceIdInput = (e) => {
    setSpaceId(e.target.value)
  }

  console.log('drizzle', drizzle)
  
  // destructure drizzle and drizzleState from props
  return (
    <div>
      <div>
        <h1>Creadit Smart Contract</h1>
      </div>

      <div className="section">
        <h2>Next Space Id</h2>
        <ContractData
          drizzle={drizzle}
          drizzleState={drizzleState}
          contract="Creadit"
          method="nextSpaceId"
        />
      </div>

      <div className="section">
        <h2>Space by Id: 1</h2>
        <div>
          <input type='text' value={spaceId} onChange={handleSpaceIdInput} />
        </div>
        <ContractData
          drizzle={drizzle}
          drizzleState={drizzleState}
          contract="Creadit"
          method="spaceById"
          methodArgs={[ spaceId ]}
        />
      </div>

      {/* Doesn't work :( Maybe because method has overrides */}
      {/* <div className="section">
        <h2>Register Space</h2>
        <ContractForm
          drizzle={drizzle}
          contract="Creadit"
          method="registerSpace"
          labels={["OrbitDB Address", "Wallet"]}
        />
      </div> */}
      
      <div className="section">
        <h2>Set Space Handle</h2>
        <ContractForm
          drizzle={drizzle}
          contract="Creadit"
          method="setSpaceWallet"
          // labels={["OrbitDB Address", "Wallet"]}
        />
      </div>

    </div>
  );
};
