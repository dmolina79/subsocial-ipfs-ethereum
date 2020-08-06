import * as React from 'react';
import { PageHeader, Avatar } from 'antd';
import { useRouter } from 'next/router';
import { statusTag } from '../components/utils';
import { useBucketContext } from '../components/buckets/BucketsContext';
import { useOrbitDbContext } from '../components/orbitdb';
import Link from 'next/link';
import { FillerInput } from '../components/filler/Input';
import Jdenticon from 'react-jdenticon';

type EntityStatusProps = {
  title: string,
  isReady: boolean
}

const EntityStatus = ({ title, isReady }: EntityStatusProps) => statusTag(title, isReady)

export const PageLayout = ({ children }: React.PropsWithChildren<{}>) => {
  const router = useRouter()

  const { isReady: isBucket } = useBucketContext()
  const { isReady: isOrbitDb, owner } = useOrbitDbContext()

  const isAppReady = isBucket && isOrbitDb

  const orbitDBStatus = <EntityStatus title='OrbitDB:' isReady={isOrbitDb} />
  const bucketStatus = <EntityStatus title='Buckets:' isReady={isBucket} />

  return <>
    <PageHeader
      title='Subsocial'
      subTitle={<>
        {orbitDBStatus}
        {bucketStatus}
      </>}
      extra={[
        <Link key='myFeed' href='/feed' as='/feed'><a className='ant-btn'>Feed</a></Link>,
        <Link key='mySubs' href='/subscription' as='/subscription'><a className='ant-btn'>My subscriptions</a></Link>,
        <Link key='newSpace' href={`/new-space`} as={`/new-space`}><a className='ant-btn'>New space</a></Link>,
        isAppReady && <FillerInput key='filler' />,
        isAppReady && <Avatar
          key='Unstoppabledomains'
          className='ml-4'
          icon={<Jdenticon value={owner}/>}
        />
      ]}
      style={{ borderBottom: '1px solid #ddd' }}
      onBack={() => router.push('/', '/')}
      backIcon={<img src={'/subsocial-sign.svg'} width='32' height='32' alt='Subsocial' />}
    />
    <div className='PageContent'>
      {isAppReady && children}
    </div>
  </>
}

export default PageLayout