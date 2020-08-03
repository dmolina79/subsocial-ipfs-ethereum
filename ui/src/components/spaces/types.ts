export type SpaceContent = {
  title: string,
  desc: string,
  avatar?: string | null
}

export type PostLinks = {
  postStore: string,
  postIdCounter: string
}

export type SpaceDto = {
  path: string,
  owner: string,
  created: {
    account: string,
    time: number
  }
  content: SpaceContent,
  links: PostLinks
}

export type FollowSpace = {
  spacePath: string,
  links: PostLinks,
  lastKnownPostId: number
}