import React, { useState } from 'react';
import { useAuthContext } from './AuthContext';
import Modal from 'antd/lib/modal/Modal';
import { Form, Input, Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import ethers from 'ethers'

const DOMAIN_NAME = '.crypto'

type AuthModal = {
  open: boolean,
  close: () => void
}

export const AuthModal = ({ open, close }: AuthModal) => {
  const { signIn, profile } = useAuthContext()
  const [ form ] = Form.useForm()

  const onSuccess = () => {
    console.warn('TODO: implement this function')
  }

  const onFailed = () => {
    console.warn('TODO: implement this function')
  }

  const validating = (domain: string) => {
    const tokenId = ethers.utils.namehash(domain)

    const validate = !!tokenId

    validate ? onSuccess() : onFailed()
    // TODO validating in eth
    return {
      domain,
      wallet: (window as any).web3?.eth?.accounts[0] || '0x111111111111111111111111111'
    }
  }

  const onSignIn = () => {
    const domain = form.getFieldsValue()['domain'] + DOMAIN_NAME
    console.log(domain)
    
    signIn(validating(domain.trim()))
  }

  return <Form form={form}>
    <Modal
      visible={!profile && open}
      onCancel={close}
      width={250}
      title='SignIn with crypto domain'
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
        <Input placeholder='Your .crypto domain:' addonAfter='' />
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