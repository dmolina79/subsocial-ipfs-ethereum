import React, {  } from 'react'
import { List } from 'antd';
import ViewComment from './ViewComment';
import { CommentDto } from './types';
import CommentEditor from './CommentEditor';
import { useGetRootComments, useCommentsContext } from './СommentContext';

type CommentListProps = {
  comments: CommentDto[],
  header?: React.ReactNode 
}

export const CommentList = ({ comments, header }: CommentListProps) => {

  return comments.length ? <List
  dataSource={comments}
  header={header}
  itemLayout="horizontal"
  renderItem={(comment) => <ViewComment comment={comment} />}
/> : null
}

export const Comments = () => {
  const { onCommentAdded } = useCommentsContext()
  const comments = useGetRootComments()

  return <div>
    <CommentEditor onCommentAdded={onCommentAdded} />
    {comments.length > 0 &&
      <CommentList
        comments={comments}
        header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
      />}
  </div>
}


