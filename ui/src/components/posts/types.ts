export type RegularPostContent = {
  title: string,
  body: string,
  image?: string
}

export type PostDto = {
  id: string,
  spaceId?: string,
  owner: string,
  created: {
    account: string,
    time: string
  }
  content: RegularPostContent
}