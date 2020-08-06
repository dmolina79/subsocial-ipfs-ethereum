import { List, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewPost } from './ViewPost';
import { PostDto } from './types';
import { pluralize, DEFAULT_PATH } from '../utils';
import Link from 'next/link';
import { usePostStoreContext } from './PostsContext';
import { SpaceDto } from '../spaces/types';
import { useMyDomain } from '../auth/AuthContext';

export type PostWithSpace = {
  post: PostDto,
  space: SpaceDto
}

type PostsListProps = {
  data: PostWithSpace[],
  header?: React.ReactNode
}

export const PostsList = ({ data, header }: PostsListProps) => {

  return data
    ? <List
      size="large"
      itemLayout='vertical'
      header={header}
      dataSource={data}
      renderItem={({ post, space }) => <ViewPost post={post} space={space} />}
    />
    : <em>Loading posts...</em>;
}

type DynamicPostsProps = {
  space: SpaceDto
}
const DynamicPosts = ({ space }: DynamicPostsProps) => {
  const { postStore } = usePostStoreContext()
  const [ posts, setPosts ] = useState<PostDto[] | undefined>()
  const owner = useMyDomain()
  const isMySpace = space.owner === owner

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
        data={posts.map(post => ({ post, space }))}
        header={<h2 className='d-flex justify-content-between'>
          {pluralize(posts.length, 'post')}
          {isMySpace && <Button type='primary' ghost>
            <Link href={`${DEFAULT_PATH}/[spaceId]/posts/new`} as={`${space.path}/posts/new`}>
              <a>New post</a>
            </Link>
          </Button>}
        </h2>}
      />
    : <em>Loading posts...</em>;
}

export default DynamicPosts