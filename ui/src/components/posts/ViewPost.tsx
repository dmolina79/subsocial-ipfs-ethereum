import { List, Avatar, Space, Tooltip, Empty } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect, CSSProperties } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { toShortAddress, summarize, DfBgImg } from '../utils';
import Jdenticon from 'react-jdenticon';
import CommentsProvider, { useCommentsContext } from '../comments/СommentContext';
import { useRouter } from 'next/router';
import { usePostStoreContext } from './PostsContext';

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

type PostLinkProps = {
  id: string,
  children: React.ReactNode,
  className?: string,
  style?: CSSProperties
}
const PostLink = ({ id, children, className, style }: PostLinkProps) => <Link href='/posts/[postId]' as={`/posts/${id}`} >
  <a className={className} style={style}>
    {children}
  </a>
</Link>

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
    extra={image && isPreview
      ? <DfBgImg src={image.replace('original', 'preview')} size={272} height={220} />
      : null
    }
  >
    <List.Item.Meta
      avatar={<Avatar icon={<Jdenticon value={owner}/>} />}
      title={toShortAddress(owner)}
      description={<span>
        <Tooltip title={time.format('YYYY-MM-DD HH:mm:ss')}>
          <PostLink id={id} style={{ color: '#8c8c8c', fontSize: '.85rem' }}>{time.fromNow()}</PostLink>
        </Tooltip>
      </span>}
    />
    {isPreview
      ? <PostLink style={{ color: '#222' }} id={id}>
        <h2>{title}</h2>
        <div style={{ minHeight: 80 }}>{summarize(body)}</div>
      </PostLink>
      : <div>
        <h2>{title}</h2>
        {image && <img src={image} className='PostImage' />}
        <div>{body}</div>
      </div>}
  </List.Item>
}

const ViewPost: NextPage<ViewPostPreviewProps> = ({ post }: ViewPostPreviewProps) => {
  return <div className='PostPage'>
    <PostsList posts={[ post ]} />
    <Comments />
  </div>
}

export const DynamicPost = () => {
  const { postStore } = usePostStoreContext()
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
