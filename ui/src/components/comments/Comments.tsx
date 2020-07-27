import React, {  } from 'react'
import { List } from 'antd';
import ViewComment from './ViewComment';
import { CommentDto, CommentsProviderProps } from './types';
import CommentEditor from './CommentEditor';
import CommentsProvider, { useGetRootComments, useCommentsContext } from './СommentContext';
import { pluralize } from '../utils';

type CommentListProps = {
  comments: CommentDto[],
  header?: React.ReactNode 
}

export const CommentList = ({ comments, header }: CommentListProps) => {

  return comments.length
    ? <List
        dataSource={comments}
        itemLayout="horizontal"
        renderItem={(comment) => <ViewComment comment={comment} />}
    />
    : null
}

export const Comments = () => {
  const { onCommentAdded, state: { totalCommentCount } } = useCommentsContext()
  const comments = useGetRootComments()

  return <>
    <h2>{pluralize(totalCommentCount, 'reply', 'replies')}</h2>
    <CommentEditor onCommentAdded={onCommentAdded} />
    <CommentList
      comments={comments}
    />
  </> 
}

export const CommentsWithProvider = (props: CommentsProviderProps) => <CommentsProvider {...props}><Comments /></CommentsProvider>