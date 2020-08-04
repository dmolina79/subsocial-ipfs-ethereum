import { CommentsLinks } from "../posts/types"

export type CommentDto = {
  id: string,
  body: string,
  owner: string,
  created: {
    account: string,
    time: number
  }
  parentId?: string | null
}

export type CommentValue = Omit<CommentDto,'id'> & {
  id?: string
}

export type CommentsProviderProps = {
  links: CommentsLinks
}