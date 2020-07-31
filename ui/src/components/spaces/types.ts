export type SpaceContent = {
  title: string,
  desc: string,
  avatar?: string | null
}

export type SpaceDto = {
  id: string,
  owner: string,
  created: {
    account: string,
    time: number
  }
  content: SpaceContent
}

export type FollowSpace = {
  spaceId: string,
  lastKnownPostId: number
}