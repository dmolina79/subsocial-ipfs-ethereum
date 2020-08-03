import { List, Avatar, Tooltip, Empty } from 'antd';
import { MessageOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect, CSSProperties } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { toShortAddress, summarize, DfBgImg, IconText } from '../utils';
import Jdenticon from 'react-jdenticon';
import { useRouter } from 'next/router';
import { usePostStoreContext } from './PostsContext';
import { Player } from './DPlayer';
import { useOrbitDbContext } from '../orbitdb';
import { useCommentsContext } from '../comments/СommentContext';

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
    as={`/spaces/${spaceId}/posts/${id}`}
  >
    <a className={className} style={style}>
      {children}
    </a>
  </Link>

type InnerViewPostProps = ViewPostProps & {
  preview?: React.ReactNode,
  children?: React.ReactNode
}

const useTotalCommentCount = (postId: string) => {
  const [ count, setCount ] = useState(0)
  const { orbitdb } = useOrbitDbContext()


  useEffect(() => {
    
    const getCount = async () => {

      const addCommentCount = await orbitdb.counter(`add_comment_counter_${postId}`)
      console.log('After init comment counter')
      const delCommentCount = await orbitdb.counter(`del_comment_counter_${postId}`)
      await addCommentCount.load()
      await delCommentCount.load()

      setCount(addCommentCount.value - delCommentCount.value)

      addCommentCount.close()
      delCommentCount.close()
    }

    getCount().catch(err => console.error(err))

  }, [])

  return count
}

export const InnerViewPost = ({ post: { created, owner, id, spaceId }, preview, children }: InnerViewPostProps) => {
  const time = moment(created.time)
  const { query: { postId } } = useRouter()
  const totalCommentCount = postId ? useCommentsContext().state.totalCommentCount : useTotalCommentCount(id)

  return <List.Item
    key={created.time}
    actions={[
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
      <div style={{ minHeight: 135 }}>{summarize(body)}</div>
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
    ? <PostPage post={post} />
    : <Empty description='Post not found' />
}

export default DynamicPost
