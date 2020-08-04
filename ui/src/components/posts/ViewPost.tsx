import { List, Avatar, Tooltip, Empty } from 'antd';
import { MessageOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect, CSSProperties } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { toShortAddress, summarize, DfBgImg, IconText, DEFAULT_PATH, Loading } from '../utils';
import Jdenticon from 'react-jdenticon';
import { useRouter } from 'next/router';
import { usePostStoreContext, PostStoreProviderWithLinks } from './PostsContext';
import { Player } from './DPlayer';
import { useCommentsContext, CommentsProvider } from '../comments/СommentContext';
import { useOrbitDbContext, openIdCounter } from '../orbitdb';
import CounterStore from 'orbit-db-counterstore';

type ViewPostProps = {
  post: PostDto
}

type PostLinkProps = {
  path: string,
  children: React.ReactNode,
  className?: string,
  style?: CSSProperties
}
const PostLink = ({ path, children, className, style }: PostLinkProps) => <Link
    href={path}
  >
    <a className={className} style={style}>
      {children}
    </a>
  </Link>

type InnerViewPostProps = ViewPostProps & {
  preview?: React.ReactNode,
  children?: React.ReactNode
}

const useTotalCommentCount = (addCounterLink: string) => {
  const [ count, setCount ] = useState(0)
  const { orbitdb } = useOrbitDbContext()


  useEffect(() => {
    let addCommentCount: CounterStore;
    
    const getCount = async () => {
      console.log('Before init comment counter')

      addCommentCount = await openIdCounter(orbitdb, addCounterLink)
      console.log('After init comment counter')
      // const delCommentCount = await orbitdb.counter(`del_comment_counter_${postId}`)
      await addCommentCount.load()
      // await delCommentCount.load()
      setCount(addCommentCount.value)

      addCommentCount.close()
      // delCommentCount.close()
    }

    getCount().catch(err => console.error(err))

    // return () => {
    //   addCommentCount && addCommentCount.close()
    // }

  }, [])

  return count
}

export const InnerViewPost = ({ post: { created, owner, path, links }, preview, children }: InnerViewPostProps) => {
  const time = moment(created.time)
  const totalCommentCount = preview
    ? useTotalCommentCount(links.addCounter)
    : useCommentsContext().state.totalCommentCount

  return <List.Item
    key={created.time}
    actions={[
      <IconText icon={MessageOutlined} text={totalCommentCount} key="list-vertical-message" />,
      <Link href={`${DEFAULT_PATH}/[spaceId]/posts/[postId]/edit`} as={`${path}/edit`}>
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
          <PostLink path={path} style={{ color: '#8c8c8c', fontSize: '.85rem' }}>{time.fromNow()}</PostLink>
        </Tooltip>
      </span>}
      // style={{ marginBottom: '0' }}
    />
    {children}
  </List.Item>
}

export const ViewPostPage = ({ post }: ViewPostProps) => {
  const { content: { body, title, image, video } } = post
  const previewUrl = image?.replace('original', 'preview')

  const Title = () => title ? <h2 className='mb-2'>{title}</h2> : null

  const Video = () => !video ? null : (
    <div className='PostVideo'>
      <Player video={{ url: video, name: title || '', pic: previewUrl || '' }} />
    </div>
  )

  const Image = () => !image ? null : <img src={image} className='PostImage' />
  
  return <InnerViewPost post={post}>
    <div className='card'>
      <Title />
      <Video />
      <Image />
      <div>{body}</div>
    </div>
  </InnerViewPost>
}

export const ViewPostPreview = ({ post }: ViewPostProps) => {
  const { content: { body, title, image }, path } = post

  const previewUrl = image?.replace('original', 'preview')
  const Title = () => title ? <h2>{title}</h2> : null

  return <InnerViewPost post={post} preview={previewUrl ? <DfBgImg src={previewUrl} size={272} height={220} /> : null}>
    <PostLink style={{ color: '#222' }} path={path}>
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

  if (!isLoaded) return <Loading label='Loading post...' />

  return post
    ? <CommentsProvider links={post.links}>
        <PostPage post={post} />
      </CommentsProvider>
    : <Empty description='Post not found' />
}

export default () => <PostStoreProviderWithLinks><DynamicPost /></PostStoreProviderWithLinks>
