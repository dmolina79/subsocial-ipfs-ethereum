// import Eth from '../components/eth/Eth'
import dynamic from 'next/dynamic'
const Eth = dynamic(() => import('../components/eth/Eth'), { ssr: false })

export default () => <>
  <h1>Hello Ethereum</h1>
  <Eth />
</>
