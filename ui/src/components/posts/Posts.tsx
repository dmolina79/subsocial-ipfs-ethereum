import { List, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewPost } from './ViewPost';
import { PostDto } from './types';
import { pluralize, DEFAULT_PATH } from '../utils';
import Link from 'next/link';
import { usePostStoreContext } from './PostsContext';

type PostsListProps = {
  posts: PostDto[],
  header?: React.ReactNode
}

export const PostsList = ({ posts, header }: PostsListProps) => {

  return posts
    ? <List
      size="large"
      itemLayout='vertical'
      header={header}
      dataSource={posts}
      renderItem={post => <ViewPost post={post} />}
    />
    : <em>Loading posts...</em>;
}

type DynamicPostsProps = {
  spacePath: string
}
const DynamicPosts = ({ spacePath }: DynamicPostsProps) => {
  const { postStore } = usePostStoreContext()
  const [ posts, setPosts ] = useState<PostDto[] | undefined>()

  useEffect(() => {
    if (posts?.length) return

    const loadPosts = async () => {
      const posts = await postStore.get('')
      setPosts(posts)
    }
    loadPosts().catch(err => console.error(err))
  }, [])

  return posts
    ? <PostsList
        posts={posts}
        header={<h2 className='d-flex justify-content-between'>
          {pluralize(posts.length, 'post')}
          <Button type='primary' ghost>
            <Link href={`${DEFAULT_PATH}/[spaceId]/posts/new`} as={`${spacePath}/posts/new`}>
              <a>New post</a>
            </Link>
          </Button>
        </h2>}
      />
    : <em>Loading posts...</em>;
}

export default DynamicPosts