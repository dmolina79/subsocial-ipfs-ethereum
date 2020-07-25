export type RegularPostContent = {
  title: string,
  body: string
}

export type PostDto = {
  id: string,
  owner: string,
  created: {
    account: string,
    time: string
  }
  content: RegularPostContent
}