import React from 'react'
import { drizzleReactHooks } from '@drizzle/react-plugin'
import { Drizzle } from '@drizzle/store'
import drizzleOptions from './drizzleOptions'

const { DrizzleProvider } = drizzleReactHooks
const drizzle = new Drizzle(drizzleOptions)

export function EthereumProvider (props) {
  return (
    <DrizzleProvider drizzle={drizzle}>
      {props.children}
    </DrizzleProvider>
  )
}

export default EthereumProvider
