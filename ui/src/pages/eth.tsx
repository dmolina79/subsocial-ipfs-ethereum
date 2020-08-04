// import Eth from '../components/eth/Eth'
import dynamic from 'next/dynamic'
const Content = dynamic(() => import('../components/eth/Creadit'), { ssr: false })

export default () => <div className='PageContent'>
  <h1>Hello Ethereum</h1>
  <Content />
</div>
