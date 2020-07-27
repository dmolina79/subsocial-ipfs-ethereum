import { List, Avatar, Space, Tooltip, Empty } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { useOrbitDbContext } from '../orbitdb';
import { toShortAddress, summarize } from '../utils';
import Jdenticon from 'react-jdenticon';
import CommentsProvider, { useCommentsContext } from '../comments/СommentContext';
import { useRouter } from 'next/router';

type IconTextProps = {
  icon: React.FunctionComponent,
  text: React.ReactNode
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

export const ViewPostPreview = ({ post: { content: { body, title, image }, created, owner, id } }: ViewPostPreviewProps) => {
  const time = moment(created.time)
  const { state: { totalCommentCount } } = useCommentsContext()
  const { query: { postId } } = useRouter()
  const isPreview = !postId

  return <List.Item
    key={title}
    actions={[
      <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
      <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
      <IconText icon={MessageOutlined} text={totalCommentCount} key="list-vertical-message" />,
      <Link href='/posts/[postId]/edit' as={`/posts/${id}/edit`}>
        <a style={{ color: '#8c8c8c' }}>
          <IconText icon={EditOutlined} text='Edit' key='list-vertical-edit' />
        </a>
      </Link>
    ]}
    extra={image
      ? <img
        width={272}
        height={isPreview ? 220 : undefined}
        src={image}
      />
      : null
    }
  >
    <List.Item.Meta
      avatar={<Avatar icon={<Jdenticon value={owner}/>} />}
      title={<Link href='/posts/[postId]' as={`/posts/${id}`} ><a>{title}</a></Link>}
      description={<span>
        {`${toShortAddress(owner)} - `}
        <Tooltip title={time.format('YYYY-MM-DD HH:mm:ss')}>
          <span>{time.fromNow()}</span>
        </Tooltip>
      </span>}
    />
    <div style={{ minHeight: 110 }}>{isPreview ? summarize(body) : body}</div>
  </List.Item>
}

const ViewPost: NextPage<ViewPostPreviewProps> = ({ post }: ViewPostPreviewProps) => {
  return <div className='PostPage'>
    <PostsList posts={[ post ]} />
    <Comments />
  </div>
}

export const DynamicPost = () => {
  const { postStore } = useOrbitDbContext()
  const [ post, setPost ] = useState<PostDto | undefined>()
  const [ isLoaded, setLoaded ] = useState(false)
  const { query: { postId } } = useRouter()

  useEffect(() => {
    const loadPosts = async () => {
      const post = await postStore.get('').pop()
      post && setPost(post)
      setLoaded(true)
    }
    loadPosts().catch(err => console.error(err))
  }, [ postId ])

  if (!isLoaded) return <em>Loading post...</em>

  return post
    ? <CommentsProvider postId={postId as string}>
        <ViewPost post={post} />
      </CommentsProvider>
    : <Empty description='Post not found' />
}

export default DynamicPost
