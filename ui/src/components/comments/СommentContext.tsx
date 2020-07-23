import React, { useContext, createContext, useState, useEffect } from 'react';
import { CommentDto, CommentValue } from './types';
import { useOrbitDbContext } from '../orbitdb';

function functionStub () {
  throw new Error('Function needs to be set in SubsocialApiProvider')
}

const feedItemToComment = (e: any): CommentDto => {
  const value = e.payload.value as CommentValue
  return {
    id: e.hash as string,
    ...value
  }
}

type CommentsContextType = {
  state: {
    comments: CommentDto[],
    repliesIdsById: Map<string, string[]>,
    commentById: Map<string, CommentDto>
  },
  setComments: (comments: CommentDto[]) => void,
  onCommentAdded: (comment: CommentDto) => void
}

const initMap = () => new Map<string, any>()

const initialContext: CommentsContextType = {
  state: {
    comments: [],
    repliesIdsById: initMap(),
    commentById: initMap()
  },
  setComments: functionStub,
  onCommentAdded: functionStub
}

export const CommentsContext = createContext<CommentsContextType>(initialContext);

export const useCommentsContext = () =>
  useContext(CommentsContext)

export const CommentsProvider = (props: React.PropsWithChildren<{}>) => {
  const [ comments, setComments ] = useState<CommentDto[]>([])
  const [ repliesIdsById ] = useState<Map<string, string[]>>(initMap())
  const [ commentById ] = useState<Map<string, CommentDto>>(initMap())

  const { db } = useOrbitDbContext()

  const mapReduceToMaps = (newComments: CommentDto[]) => {
    newComments.forEach(comment => {
      const { parentId, id } = comment

      const key = parentId || 'null'
      let repliesIdxs = repliesIdsById.get(key)
  
      if (!repliesIdxs) {
        repliesIdsById.set(key, [ id ])
      } else {
        repliesIdsById.set(key, [ ...repliesIdxs, id ])
      }

      commentById.set(id, comment)
    })

    setComments([ ...comments, ...newComments ])
  }

  const loadAllComments = () => {
    const allComments: CommentDto[] = db.iterator({ limit: -1 /*, reverse: true*/ })
      .collect()
      .map(feedItemToComment)

    mapReduceToMaps(allComments)
  }

  const onCommentAdded = (comment: CommentDto) => mapReduceToMaps([ comment ])

  useEffect(loadAllComments, [])

  return <CommentsContext.Provider value={{
      state: { repliesIdsById, commentById, comments },
      setComments,
      onCommentAdded
    }}>
      {props.children}
    </CommentsContext.Provider>
}

export const useGetRepliesById = (id: string): CommentDto[] => {
  const { state: { repliesIdsById, commentById } } = useCommentsContext()
  const repliesIds = repliesIdsById.get(id)
  return repliesIds
    ? repliesIds
      .map(x => commentById.get(x))
      .filter(x => x !== undefined) as CommentDto[]
    : []
}

export const useGetRootComments = () => useGetRepliesById('null')

export default CommentsProvider