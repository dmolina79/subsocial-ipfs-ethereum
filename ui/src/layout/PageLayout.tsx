import * as React from 'react';
import { PageHeader } from 'antd';
import { useRouter } from 'next/router';
import { Loading } from '../components/utils';
import { useBucketContext } from '../components/buckets/BucketsContext';
import { useOrbitDbContext } from '../components/orbitdb';
import Link from 'next/link';
import { FillerInput } from '../components/filler/Input';
import { AuthView } from '../components/auth/AuthView';
import { useAuthContext } from '../components/auth/AuthContext';

// type EntityStatusProps = {
//   title: string,
//   isReady: boolean
// }

// const EntityStatus = ({ title, isReady }: EntityStatusProps) => statusTag(title, isReady)

export const PageLayout = ({ children }: React.PropsWithChildren<{}>) => {
  const router = useRouter()

  const { isReady: isBucket } = useBucketContext()
  const { isReady: isOrbitDb } = useOrbitDbContext()
  const { profile } = useAuthContext()

  const isAppReady = isBucket && isOrbitDb

  // const orbitDBStatus = <EntityStatus title='OrbitDB:' isReady={isOrbitDb} />
  // const bucketStatus = <EntityStatus title='Buckets:' isReady={isBucket} />

  return <>
    <PageHeader
      title='Subsocial'
      extra={[
        profile && <>
          <Link key='myFeed' href='/feed' as='/feed'><a className='ant-btn ant-btn-text'>Feed</a></Link>
          <Link key='mySubs' href='/subscription' as='/subscription'><a className='ant-btn ant-btn-text'>My subs.</a></Link>
          <Link key='newSpace' href={`/new-space`} as={`/new-space`}><a className='ant-btn ant-btn-text'>New space</a></Link>
          <FillerInput key='filler' />
        </>,
        isAppReady && <AuthView key='auth' />
      ]}
      style={{ borderBottom: '1px solid #ddd' }}
      onBack={() => router.push('/', '/')}
      backIcon={<img src={'/subsocial-sign.svg'} width='32' height='32' alt='Subsocial' />}
    />
    <div className='PageContent'>
      {isAppReady ? children : <Loading label='Initialization app...' />}
    </div>
  </>
}

export default PageLayout