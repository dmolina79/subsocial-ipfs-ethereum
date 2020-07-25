import { List } from 'antd';
import React from 'react';
import { ViewPostPreview } from './ViewPost';
import { PostDto } from './types';
import { useOrbitDbContext } from '../orbitdb';

const listData: PostDto[] | undefined = [];
for (let i = 0; i < 23; i++) {
  listData.push({
    id: '4',
    content: {
      body: 'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
      title: 'Post with id: 4'
    },
    owner: 'i am some account',
    created: {
      account: 'i am some account',
      time: 'Mon 10 Dec 2018'
    }
  });
}

type PostsListProps = {
  posts: PostDto[]
}

export const PostsList = ({ posts }: PostsListProps) => {
  const { postTotalCounter: { value: count } } = useOrbitDbContext()

  return <List
    itemLayout="vertical"
    header={<h2>{count ? count : null}</h2>}
    size="large"
    dataSource={posts}
    renderItem={post => <ViewPostPreview post={post} />}
  />
}

export const Posts = () => <PostsList posts={listData} />

export default Posts