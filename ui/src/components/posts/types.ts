// TODO Rename to PostContent
export type AllValues = {
  title?: string,
  body?: string,
  image?: string,
  video?: string

  // Fields needed for encryption:
  encrypted?: boolean
  encryptionNonce?: string
  secretHash?: string
}

export type CommentsLinks = {
  addCounter: string,
  delCounter?:string,
  commentStore: string
}

export type PostDto = {
  path: string,
  spacePath: string,
  owner: string,
  created: {
    account: string,
    time: number
  }
  content: AllValues,
  links: CommentsLinks
}
