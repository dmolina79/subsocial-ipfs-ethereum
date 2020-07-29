export type SpaceContent = {
  title: string,
  desc: string,
  avatar?: string
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