import { List, Avatar, Tooltip, Empty } from 'antd';
import { MessageOutlined, EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect, CSSProperties } from 'react';
import { Comments } from '../comments/Comments';
import { NextPage } from 'next';
import Link from 'next/link'
import { PostDto } from './types';
import { PostsList } from './Posts';
import moment from 'moment';
import { toShortAddress, summarize, IconText, DEFAULT_PATH, Loading } from '../utils';
import Jdenticon from 'react-jdenticon';
import { useRouter } from 'next/router';
import { usePostStoreContext, PostStoreProviderWithLinks } from './PostsContext';
import { Player } from './DPlayer';
import { useCommentsContext, CommentsProvider } from '../comments/СommentContext';
import { useOrbitDbContext, openIdCounter } from '../orbitdb';
import CounterStore from 'orbit-db-counterstore';

type ViewPostProps = {
  post: PostDto,
  preview?: boolean
}

type PostLinkProps = {
  path: string,
  children: React.ReactNode,
  hash?: string,
  className?: string,
  style?: CSSProperties
}
const PostLink = ({ path, children, className, style, hash }: PostLinkProps) => <Link
    href={`${DEFAULT_PATH}/[spaceId]/posts/[postId]`}
    as={`${path}${hash ? '#'+hash : ''}`}
  >
    <a className={`DfBlackLink ${className}`} style={style}>
      {children}
    </a>
  </Link>

type InnerViewPostProps = ViewPostProps & {
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
      <PostLink path={path} hash='comments'>
        <IconText icon={MessageOutlined} text={totalCommentCount} key="list-vertical-message" />
      </PostLink>,
      <Link href={`${DEFAULT_PATH}/[spaceId]/posts/[postId]/edit`} as={`${path}/edit`}>
        <a style={{ color: '#8c8c8c' }}>
          <IconText icon={EditOutlined} text='Edit' key='list-vertical-edit' />
        </a>
      </Link>
    ]}
    className='PostItem'
  >
    <List.Item.Meta
      avatar={<Avatar icon={<Jdenticon value={owner}/>} />}
      title={toShortAddress(owner)}
      description={<span>
        <Tooltip title={time.format('YYYY-MM-DD HH:mm:ss')}>
          <PostLink path={path} style={{ color: '#8c8c8c', fontSize: '.85rem' }}>{time.fromNow()}</PostLink>
        </Tooltip>
      </span>}
    />
    {children}
  </List.Item>
}

const Title = ({ post: { content: { title}, path } }: ViewPostProps) =>
  title ? <h2 className='mb-2'><PostLink path={path}>{title}</PostLink></h2> : null

const Body = ({ post: { content }, preview }: ViewPostProps) => {
  const { title, body } = content
  const shortStatus = !title && body && body.length <= 140
  return <div>{shortStatus ? <h2>{body}</h2> : (preview ? summarize(body) : body)}</div>
}

export const ViewPostPage = (props: ViewPostProps) => {
  const { post } = props
  const { content } = post
  const { title, image, video } = content

  const previewUrl = image?.replace('original', 'preview')

  const Video = () => !video ? null : (
    <div className='PostVideo'>
      <Player video={{ url: video, name: title || '', pic: previewUrl || '' }} />
    </div>
  )

  const Image = () => (!image || video) ? null : <img src={image} className='PostImage' />
  
  return <InnerViewPost {...props}>
    <div className='card'>
      <Title {...props} />
      <Video />
      <div className='d-flex justify-content-center'>
        <Image />
      </div>
      <Body {...props} />
    </div>
  </InnerViewPost>
}

export const ViewPost = ({ post }: ViewPostProps) => {
  const { query: { postId } } = useRouter()
  
  const isPreview = !postId

  return <ViewPostPage post={post} preview={isPreview}/>
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

  useEffect(() => {
    const loadPosts = async () => {
      const path = window.location.pathname
      const post = await postStore.get(path).pop()
      post && setPost(post)
      setLoaded(true)
    }
    loadPosts().catch(err => console.error(err))
  }, [])

  if (!isLoaded) return <Loading label='Loading post...' />

  return post
    ? <CommentsProvider links={post.links}>
        <PostPage post={post} />
      </CommentsProvider>
    : <Empty description='Post not found' />
}

export default () => <PostStoreProviderWithLinks><DynamicPost /></PostStoreProviderWithLinks>
