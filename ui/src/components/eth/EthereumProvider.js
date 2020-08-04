import React from 'react'
import { drizzleReactHooks } from '@drizzle/react-plugin'
import { drizzle } from './drizzle'

const { DrizzleProvider } = drizzleReactHooks

export function EthereumProvider (props) {
  return (
    <DrizzleProvider drizzle={drizzle}>
      {props.children}
    </DrizzleProvider>
  )
}

export default EthereumProvider
