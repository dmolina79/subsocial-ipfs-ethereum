import React, {  } from 'react'
import { List } from 'antd';
import ViewComment from './ViewComment';
import { CommentDto } from './types';
import CommentEditor from './CommentEditor';
import { useGetRootComments, useCommentsContext } from './СommentContext';
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
    <h3 className='border-top pt-2'>{pluralize(totalCommentCount, 'comment')}</h3>
    <CommentEditor onCommentAdded={onCommentAdded} />
    <CommentList
      comments={comments}
    />
  </> 
}

export default Comments