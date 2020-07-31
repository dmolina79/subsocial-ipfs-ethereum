import React, { useState } from 'react';
import { Comment, Tooltip, Avatar } from 'antd';
import moment from 'moment';
import { CommentProps } from 'antd/lib/comment'
import { useCommentsContext, useGetRepliesById } from './СommentContext';
import CommentEditor from './CommentEditor';
import { CommentList } from './Comments';
import { toShortAddress } from '../utils';
import Jdenticon from 'react-jdenticon';
import { CommentDto } from './types';

export type ViewCommentProps = Partial<CommentProps> & {
  comment: CommentDto
}

type RepliesListProps = {
  id: string
}

const RepliesList = ({ id }: RepliesListProps) => {
  const replies = useGetRepliesById(id)
  return <CommentList comments={replies} />
}

export const ViewComment = ({ comment: { id, body, owner, created } ,...antProps}: ViewCommentProps) => {
  const [ showReplyForm, setShowReplyForm ] = useState(false)
  const { onCommentAdded } = useCommentsContext()

  const time = moment(created.time)

  const actions = [
    <span
      key="comment-basic-reply-to"
      onClick={() => setShowReplyForm(!showReplyForm)}
    >
      Reply
    </span>,
  ];

  return (
    <Comment
      {...antProps}
      actions={actions}
      author={toShortAddress(owner)}
      avatar={
        <Avatar
          icon={<Jdenticon value={owner}/>}
        />
      }
      content={
        <p>{body}</p>
      }
      datetime={
        <Tooltip title={time.format('YYYY-MM-DD HH:mm:ss')}>
          <span>{time.fromNow()}</span>
        </Tooltip>
      }
    >
      {showReplyForm &&
        <CommentEditor
          onCommentAdded={(comment) => {
            onCommentAdded(comment)
            setShowReplyForm(false)
          }}
          parentId={id}
        />}
      <RepliesList id={id} />
    </Comment>
  );
};

export default ViewComment;
