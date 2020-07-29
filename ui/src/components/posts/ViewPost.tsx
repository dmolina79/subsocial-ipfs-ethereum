import { List, Avatar, Tooltip, Empty } from 'antd';
import { MessageOutlined, LikeOutlined, StarOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect, CSSProperties } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { toShortAddress, summarize, DfBgImg, IconText } from '../utils';
import Jdenticon from 'react-jdenticon';
import CommentsProvider, { useCommentsContext } from '../comments/СommentContext';
import { useRouter } from 'next/router';
import { usePostStoreContext, withPostStoreProvider } from './PostsContext';
import { Player } from './DPlayer';

type ViewPostProps = {
  post: PostDto
}

type PostLinkProps = {
  id: string,
  spaceId: string,
  children: React.ReactNode,
  className?: string,
  style?: CSSProperties
}
const PostLink = ({ id, spaceId, children, className, style }: PostLinkProps) => <Link
    href='/spaces/[spaceId]/posts/[postId]'
    as={`/spaces/${spaceId}posts/${id}`}
  >
    <a className={className} style={style}>
      {children}
    </a>
  </Link>

type InnerViewPostProps = ViewPostProps & {
  preview?: React.ReactNode,
  children?: React.ReactNode
}

export const InnerViewPost = ({ post: { created, owner, id, spaceId }, preview, children }: InnerViewPostProps) => {
  const time = moment(created.time)
  const { state: { totalCommentCount } } = useCommentsContext()

  return <List.Item
    key={created.time}
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
    extra={preview}
  >
    <List.Item.Meta
      avatar={<Avatar icon={<Jdenticon value={owner}/>} />}
      title={toShortAddress(owner)}
      description={<span>
        <Tooltip title={time.format('YYYY-MM-DD HH:mm:ss')}>
          <PostLink id={id} spaceId={spaceId} style={{ color: '#8c8c8c', fontSize: '.85rem' }}>{time.fromNow()}</PostLink>
        </Tooltip>
      </span>}
      style={{ marginBottom: '0' }}
    />
    {children}
  </List.Item>
}

export const ViewPostPage = ({ post }: ViewPostProps) => {
  const { content: { body, title, image, video } } = post
  const previewUrl = image?.replace('original', 'preview')

  const Title = () => title ? <h2 className='mb-2'>{title}</h2> : null

  const Media = () => video
    ? <Player
      video={{ url: video, name: title || '', pic: previewUrl || '' }}
    />
    : <img src={image} className='PostImage' /> || null

  return <InnerViewPost post={post}>
    <div className='card'>
        <Title />
        <Media />
        <div className='mt-2'>{body}</div>
    </div>
  </InnerViewPost>
}

export const ViewPostPreview = ({ post }: ViewPostProps) => {
  const { content: { body, title, image }, id, spaceId } = post

  const previewUrl = image?.replace('original', 'preview')
  const Title = () => title ? <h2>{title}</h2> : null

  return <InnerViewPost post={post} preview={previewUrl ? <DfBgImg src={previewUrl} size={272} height={220} /> : null}>
    <PostLink style={{ color: '#222' }} id={id} spaceId={spaceId}>
      <Title />
      <div style={{ minHeight: 80 }}>{summarize(body)}</div>
    </PostLink>
</InnerViewPost>
}

export const ViewPost = ({ post }: ViewPostProps) => {
  const { query: { postId } } = useRouter()
  
  const isPreview = !postId

  return isPreview
    ? <ViewPostPreview post={post} />
    : <ViewPostPage post={post} />
}

const PostPage: NextPage<ViewPostProps> = ({ post }: ViewPostProps) => {
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
      const post = await postStore.get(postId).pop()
      post && setPost(post)
      setLoaded(true)
    }
    loadPosts().catch(err => console.error(err))
  }, [ postId ])

  if (!isLoaded) return <em>Loading post...</em>

  return post
    ? <CommentsProvider postId={postId as string}>
        <PostPage post={post} />
      </CommentsProvider>
    : <Empty description='Post not found' />
}

export default withPostStoreProvider(DynamicPost)
