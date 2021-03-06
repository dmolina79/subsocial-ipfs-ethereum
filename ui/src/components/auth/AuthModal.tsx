import React, { useState } from 'react';
import { useAuthContext } from './AuthContext';
import Modal from 'antd/lib/modal/Modal';
import { Form, Input, Button, notification } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import Resolution from '@unstoppabledomains/resolution'

const infuraProjId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
const infuraApiUrl = `https://mainnet.infura.io/v3/${infuraProjId}`

const resolution = new Resolution({
  blockchain: {
    ens: { url: infuraApiUrl },
    cns: { url: infuraApiUrl }
  }
})

async function getDomainOwner(cryptoDomain: string) {
  return await resolution.owner(cryptoDomain)
}

async function isDomainOwner(cryptoDomain: string, maybeOwnerEthAddr: string) {
  const realOwner = (await getDomainOwner(cryptoDomain))?.toLowerCase()
  return realOwner === maybeOwnerEthAddr.toLowerCase()
}

const DOMAIN_NAME = '.crypto'

type AuthModal = {
  open: boolean,
  close: () => void
}

export const AuthModal = ({ open, close }: AuthModal) => {
  const { signIn, profile } = useAuthContext()
  const [ form ] = Form.useForm()

  const validateMyCryptoDomain = async (domain: string) => {
    const { ethereum, Web3 } = (window as any)

    if (!ethereum) {
      console.error('window.ethereum is undefined')
      return
    }

    if (!Web3) {
      console.error('window.Web3 is undefined')
      return
    }

    const web3 = new Web3(ethereum)
    const [ myEthAddr ] = await ethereum.enable().catch((err: any) => {
      console.error(`User denied access to their Ethereum account. ${err}`)
    })

    console.log('web3', web3)
    console.log('myEthAddr', myEthAddr)

    if (!myEthAddr) {
      console.error('Cannot access the current Ethereum account')
      return
    }

    const isMyDomain: boolean = await isDomainOwner(domain, myEthAddr)
    const placement = 'bottomLeft'

    if (isMyDomain) {
      notification.open({
        placement, 
        type: 'success',
        message: 'Successfully signed in'
      })

      return {
        domain,
        wallet: myEthAddr
      }
    } else {
      notification.open({
        placement,
        type: 'error',
        message: 'Failed to sign in',
        description: `You are not an owner of this domain: ${domain}`,
      })
    }
  }

  const onSignIn = async () => {
    const myDomain = (form.getFieldsValue()['domain'] + DOMAIN_NAME)?.trim()
    console.log('myDomain:', myDomain)
    
    const validInfo = await validateMyCryptoDomain(myDomain)
    validInfo && signIn(validInfo)
  }

  return <Form form={form}>
    <Modal
      visible={!profile && open}
      onCancel={close}
      width={250}
      title='Sign in with crypto domain'
      footer={
        <Form.Item>
          <Button htmlType="submit" onClick={onSignIn} type="primary">
            Sign in
          </Button>
        </Form.Item>
      }
    >
      <Form.Item
        name={'domain'}
        hasFeedback
        rules={[
          { required: true, message: 'Crypto domain is required.' }
        ]}
      >
        <Input placeholder='Your .crypto domain:' addonAfter={DOMAIN_NAME} />
      </Form.Item>
    </Modal>
  </Form>
}

export const SignInButton = () => {
  const [ open, setOpen ] = useState(false)

  return <>
    <Button htmlType="submit" onClick={() => setOpen(true)} type="primary" ghost>
      <LoginOutlined />
      Sign in
    </Button>
    <AuthModal open={open} close={() => setOpen(false)} />
  </>
}