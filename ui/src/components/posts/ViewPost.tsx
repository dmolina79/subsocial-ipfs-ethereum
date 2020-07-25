import { List, Avatar, Space } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined } from '@ant-design/icons';
import React from 'react';
import { CommentsWithProvider } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';

type IconTextProps = {
  icon: React.FunctionComponent,
  text: string
}

const IconText = ({ icon, text }: IconTextProps) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

type ViewPostPreviewProps = {
  post: PostDto
}

export const ViewPostPreview = ({ post: { content: { body, title }, created, owner, id: id }}: ViewPostPreviewProps) => {
  const time = moment(created.time)

  return <List.Item
    key={title}
    actions={[
      <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
      <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
      <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
    ]}
    extra={
      <img
        width={272}
        alt="logo"
        src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
      />
    }
  >
    <List.Item.Meta
      avatar={<Avatar src={'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'} />}
      title={<Link href={'/posts/[id]'} as={`/posts/${id}`}><a>{title}</a></Link>}
      description={`${owner} - ${time.fromNow()}`}
    />
    {body}
  </List.Item>
}

export const ViewPost: NextPage<ViewPostPreviewProps> = ({ post }: ViewPostPreviewProps) => {
  return <div>
    <PostsList posts={[ post ]} />
    <CommentsWithProvider postId={post.id} />
  </div>
}

ViewPost.getInitialProps = async ({ query: { id } }) => {
  const postId = id as string
  const post: PostDto = {
    id: postId,
    content: {
      body: 'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
      title: 'Post with id: 4'
    },
    owner: 'i am some account',
    created: {
      account: 'i am some account',
      time: 'Mon 10 Dec 2018'
    }
  }

  return { 
    post
  }
}