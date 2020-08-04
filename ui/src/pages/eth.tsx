// import Eth from '../components/eth/Eth'
import dynamic from 'next/dynamic'
const Drizzle = dynamic(() => import('../components/eth/Drizzle'), { ssr: false })

export default () => <>
  <h1>Hello Ethereum</h1>
  <Drizzle />
</>
