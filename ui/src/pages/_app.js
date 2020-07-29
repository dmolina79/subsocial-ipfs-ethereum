import React from 'react'
import App from 'next/app'
import Head from 'next/head'

import { OrbitDbProvider } from '../components/orbitdb'
import { SpaceStoreProvider } from '../components/spaces/SpaceContext'
import { BucketProvider } from '../components/buckets/BucketsContext'
import PageLayout from '../layout/PageLayout'

import 'antd/dist/antd.css'
import '../styles/main.less'
import '../styles/bootstrap-utilities-4.3.1.less'
import '../styles/ant-override.less'

function MyApp (props) {
  const { Component, pageProps } = props
  return (
    <>
      <Head>
        {/* <script src="/env.js" /> */}
      </Head>
      <OrbitDbProvider>
        <BucketProvider>
          <PageLayout >
            <SpaceStoreProvider>
              <Component {...pageProps} />
            </SpaceStoreProvider>
          </PageLayout>
        </BucketProvider>
      </OrbitDbProvider>
    </>
  )
}

export default MyApp;
