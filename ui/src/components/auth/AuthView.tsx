import React from 'react';
import { useAuthContext, Profile } from './AuthContext';
import Avatar from 'antd/lib/avatar/avatar';
import Jdenticon from 'react-jdenticon';
import { SignInButton } from './AuthModal';
// import { LogoutOutlined } from '@ant-design/icons';
import { toShortAddress } from '../utils';
import { Button } from 'antd';

type ProfilePreview = {
  profile: Profile
}

export const ProfilePreview = ({ profile }: ProfilePreview) => {
  const { domain, wallet } = profile

  return <span className='d-flex'>
      <Avatar
        key='Unstoppabledomains'
        icon={<Jdenticon value={domain}/>}
      />
      <div className='d-block NormalLineHeight'>
        <b>{domain}</b>
        <div className='ExtraDetails'>
          <a className='DfBlackLink MutedText' href={`https://etherscan.io/address/${wallet}`} target='_blank'>
            {toShortAddress(wallet)}
          </a>
        </div>
      </div>
  </span>
}

export const AuthView = () => {
  const { profile, signOut } = useAuthContext()

  return profile
    ? <>
      <Button key='sign-out' type='text' onClick={signOut}>Sign out</Button>
      <ProfilePreview key='profile-preview' profile={profile} />
    </>
    : <SignInButton key='sign-in' />
}