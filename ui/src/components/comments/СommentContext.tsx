import React, { useContext, createContext, useState, useEffect } from 'react';
import { CommentDto, CommentValue, CommentsProviderProps } from './types';
import { useOrbitDbContext } from '../orbitdb';
import FeedStore from 'orbit-db-feedstore';
import CounterStore from 'orbit-db-counterstore';

function functionStub() {
  throw new Error('Function needs to be set in SubsocialApiProvider')
}

const feedItemToComment = (e: any): CommentDto => {
  const value = e.payload.value as CommentValue
  return {
    id: e.hash as string,
    ...value
  }
}

type CommentFeed = FeedStore<CommentDto>

type CommentsContextType = {
  state: {
    comments: CommentDto[],
    commentStore: CommentFeed,
    repliesIdsById: Map<string, string[]>,
    commentById: Map<string, CommentDto>,
    totalCommentCount: number,
    isReady: boolean
  },
  setComments: (comments: CommentDto[]) => void,
  onCommentAdded: (comment: CommentDto) => void
}

const initMap = () => new Map<string, any>()

const initialContext: CommentsContextType = {
  state: {
    comments: [],
    commentStore: {} as any as CommentFeed,
    totalCommentCount: 5,
    repliesIdsById: initMap(),
    commentById: initMap(),
    isReady: false
  },
  setComments: functionStub,
  onCommentAdded: functionStub
}

export const CommentsContext = createContext<CommentsContextType>(initialContext);

export const useCommentsContext = () =>
  useContext(CommentsContext)

export const CommentsProvider = ({ postId, children }: React.PropsWithChildren<CommentsProviderProps>) => {
  const [comments, setComments] = useState<CommentDto[]>(initialContext.state.comments)
  const [repliesIdsById] = useState<Map<string, string[]>>(initMap())
  const [commentById] = useState<Map<string, CommentDto>>(initMap())
  const [commentStore, setCommentStore] = useState<CommentFeed>(initialContext.state.commentStore)
  const [totalCommentCount, setTotalCommentCount] = useState<number>(0)
  const [isReady, setIsReady] = useState(false)

  const { orbitdb } = useOrbitDbContext()

  const mapReduceToMaps = (newComments: CommentDto[]) => {
    newComments.forEach(comment => {
      const { parentId, id } = comment

      const key = parentId || 'null'
      let repliesIdxs = repliesIdsById.get(key)

      if (!repliesIdxs) {
        repliesIdsById.set(key, [id])
      } else {
        repliesIdsById.set(key, [...repliesIdxs, id])
      }

      commentById.set(id, comment)
    })

    setComments(comments.concat(newComments))
  }

  const loadAllComments = (db: CommentFeed) => {
    const allComments: CommentDto[] = db.iterator({ limit: -1 /*, reverse: true*/ })
      .collect()
      .map(feedItemToComment)
    mapReduceToMaps(allComments)
  }

  const onCommentAdded = (comment: CommentDto) => { 
    mapReduceToMaps([comment])
  }

  useEffect(() => {

    let addCommentCount: CounterStore;
    let delCommentCount: CounterStore;
    let commentStore: CommentFeed

    const initAllComments = async () => {
      addCommentCount = await orbitdb.counter(`add_comment_counter_${postId}`)
      delCommentCount = await orbitdb.counter(`del_comment_counter_${postId}`)
      await addCommentCount.load()
      await delCommentCount.load()
  
      setTotalCommentCount(addCommentCount.value - delCommentCount.value)
  
      commentStore = await orbitdb.open(`post/${postId}/comments`, {
        create: true,
        type: 'feed',
        replicate: true
      }) as CommentFeed
  
      await commentStore.load();
    
      setCommentStore(commentStore)
  
      commentStore.events.on('write', async (address, entry, heads) => {
        switch (entry.payload.op) {
          case 'ADD': {
            await addCommentCount.inc()
            break;
          }
          case 'DEL': {
            await delCommentCount.inc()
            break;
          }
        }
  
        setTotalCommentCount(addCommentCount.value - delCommentCount.value)
      });
  
      (window as any).commentStore = commentStore
  
      loadAllComments(commentStore)
      setIsReady(true)
    }

    initAllComments()

    return () => {
      addCommentCount.close()
      delCommentCount.close()
      commentStore.close()
    }
  }, [ postId ])

  return <CommentsContext.Provider value={{
    state: {
      repliesIdsById,
      commentById,
      comments,
      commentStore,
      totalCommentCount,
      isReady
    },
    setComments,
    onCommentAdded
  }}>
    {children}
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