import React, { createElement, useState } from 'react';
import { Comment, Tooltip, Avatar } from 'antd';
import moment from 'moment';
import { DislikeOutlined, LikeOutlined, DislikeFilled, LikeFilled } from '@ant-design/icons';
import { CommentDto } from './types';
import { CommentProps } from 'antd/lib/comment'
import { useCommentsContext, useGetRepliesById } from './СommentContext';
import CommentEditor from './CommentEditor';
import { CommentList } from './Comments';

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
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [action, setAction] = useState<string>();
  const [ showReplyForm, setShowReplyForm ] = useState(false)
  const { onCommentAdded } = useCommentsContext()

  const time = moment(created.time)

  const like = () => {
    setLikes(1);
    setDislikes(0);
    setAction('liked');
  };

  const dislike = () => {
    setLikes(0);
    setDislikes(1);
    setAction('disliked');
  };

  const actions = [
    <Tooltip key="comment-basic-like" title="Like">
      <span onClick={like}>
        {createElement(action === 'liked' ? LikeFilled : LikeOutlined)}
        {' '}
        <span className="comment-action">{likes}</span>
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-dislike" title="Dislike">
      <span onClick={dislike}>
        {React.createElement(action === 'disliked' ? DislikeFilled : DislikeOutlined)}
        {' '}
        <span className="comment-action">{dislikes}</span>
      </span>
    </Tooltip>,
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
      author={<a>{owner}</a>}
      avatar={
        <Avatar
          src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          alt={owner}
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
