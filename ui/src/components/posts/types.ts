export type ArticlePostContent = {
  title: string,
  body: string
}

export type StatusPostContent = {
  title: string
}

export type ImagePostContent = {
  body: string,
  image: string
}

export type VideoPostContent = {
  body: string,
  image: string,
  video: string
}

export type AllValues = {
  title?: string,
  body?: string,
  image?: string,
  video?: string
}
export type CommentsLinks = {
  addCounter: string,
  delCounter?:string,
  commentStore: string
}

export type PostContent = ArticlePostContent | StatusPostContent | ImagePostContent | VideoPostContent

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