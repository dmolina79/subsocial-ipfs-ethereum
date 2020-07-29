import { List, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewPost } from './ViewPost';
import { PostDto } from './types';
import { pluralize } from '../utils';
import Link from 'next/link';
import { usePostStoreContext, withPostStoreProvider } from './PostsContext';

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
  spaceId: string
}
const DynamicPosts = ({ spaceId }: DynamicPostsProps) => {
  const { postStore, nextPostId: { value: count } } = usePostStoreContext()
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
          {pluralize(count, 'post')}
          <Button type='primary' ghost>
            <Link href='/spaces/[spaceId]/posts/new' as={`/spaces/${spaceId}/posts/new`}>
              <a>New post</a>
            </Link>
          </Button>
        </h2>}
      />
    : <em>Loading posts...</em>;
}

export default withPostStoreProvider(DynamicPosts)