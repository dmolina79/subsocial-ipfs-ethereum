import { drizzleReactHooks } from '@drizzle/react-plugin'

export const useDrizzle = () => {
  const { useDrizzle: res } = drizzleReactHooks
  return res
}

export const useDrizzleState = () => {
  const { useDrizzleState: res } = drizzleReactHooks
  return res((state: any) => state)
}

export const useMyEthAddress = () => {
  const state = useDrizzleState()
  return state.accounts[0]
}
