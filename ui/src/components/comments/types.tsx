export type CommentDto = {
  id: string,
  body: string,
  owner: string,
  created: {
    account: string,
    time: string
  }
  parentId?: string | null
}

export type CommentValue = Omit<CommentDto,'id'> & {
  id?: string
}