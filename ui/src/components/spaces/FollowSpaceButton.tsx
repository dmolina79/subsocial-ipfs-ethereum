import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { SpaceDto } from './types';
import { useFollowSpaceStoreContext } from './FollowSpaceContext';

type InnerFollowButton = {
  isFollow?: boolean,
  onClick?: () => void
}

export const InnerFollowButton = ({ isFollow, onClick }: InnerFollowButton) => {

  if (isFollow === undefined) return <Button loading >Connecting...</Button>

  return <Button
    onClick={onClick}
    type={isFollow ? 'default' : 'primary'}
  >
    {isFollow ? 'Unfollow' : 'Follow'}
  </Button>
}

type FollowSpaceButton = {
  space: SpaceDto
}

export const FollowSpaceButton = ({ space: { path, links } }: FollowSpaceButton) => {
  const { followSpaceStore } = useFollowSpaceStoreContext()
  const [ isFollow, setFollow ] = useState<boolean>()

  useEffect(() => {
    setFollow(!!followSpaceStore.query(({ spacePath }) => spacePath === path).length);
  }, [])

  const onFollow = async () => {
    await followSpaceStore.put({ spacePath: path, lastKnownPostId: 0, links: { ...links } })
    setFollow(true)
  }

  const onUnfollow = async () => {
    await followSpaceStore.del(path)
    setFollow(false)
  }

  return <InnerFollowButton isFollow={isFollow} onClick={isFollow ? onUnfollow : onFollow} />

}