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

export const FollowSpaceButton = ({ space: { id } }: FollowSpaceButton) => {
  const { followSpaceStore } = useFollowSpaceStoreContext()
  const [ isFollow, setFollow ] = useState<boolean>()

  useEffect(() => {
    setFollow(!!followSpaceStore.query(({ spaceId }) => spaceId === id).length);
  }, [])

  const onFollow = async () => {
    await followSpaceStore.put({ spaceId: id, lastKnownPostId: 0 })
    setFollow(true)
  }

  const onUnfollow = async () => {
    await followSpaceStore.del(id)
    setFollow(false)
  }

  return <InnerFollowButton isFollow={isFollow} onClick={isFollow ? onUnfollow : onFollow} />

}