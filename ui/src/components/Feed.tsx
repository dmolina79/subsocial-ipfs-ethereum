import React, { useState, useEffect } from 'react';
import { openPostStore, getPostIdCounterAddress } from './posts/PostsContext';
import { PostDto } from './posts/types';
import { PostsList } from './posts/Posts';
import { pluralize, Loading } from './utils';
import { useOrbitDbContext } from './orbitdb';
import EventStore from 'orbit-db-eventstore';
import CounterStore from 'orbit-db-counterstore';
import { useFollowSpaceStoreContext } from './spaces/FollowSpaceContext';
import { orbitConst } from './orbitdb/orbitConn';

type Feed = EventStore<PostDto>

export const Feed = () => {
  const { followSpaceStore } = useFollowSpaceStoreContext()
  const { orbitdb } = useOrbitDbContext()
  const [ posts, setPosts ] = useState<PostDto[] | undefined>()

  const closeConn = async () => {
    const {
      postStore,
      nextPostId
    } = orbitConst
  
    postStore && await postStore.close()
    nextPostId && await nextPostId.close()
  }

  useEffect(() => {
    const loadFeed = async () => {
      const followSpace = followSpaceStore.get('')

      const feed: Feed = await orbitdb.eventlog('feed')

      await feed.load()

      console.log('Init feed')

      for (const { spaceId, lastKnownPostId } of followSpace) {

        const postStore = await openPostStore(orbitdb, spaceId)
        console.log('Before init counter')
        const postIdCounter = await orbitdb.open(getPostIdCounterAddress(spaceId), {
          create: true,
          type: 'counter'
        }) as CounterStore

        console.log('After init counter')


        await postStore.load()
        await postIdCounter.load()

        const { value: lastPostId } = postIdCounter

        if (lastKnownPostId < lastPostId) {

          const ids: string[] = []
          for (let i = lastKnownPostId + 1; i <= lastPostId; i++) {
            ids.push(i.toString())
          }
  
          const posts = postStore.query(({ id }) => ids.includes(id)).sort((a, b) => b.created.time - a.created.time)

          for (const post of posts) {
            await feed.add(post)
          }
  
          followSpaceStore.put({ spaceId, lastKnownPostId: lastPostId })
        }

        postStore.close()
        postIdCounter.close()
      }

      setPosts(feed.iterator({ limit: -1 })
      .collect()
      .map((e) => e.payload.value))

      feed.close()
    }
    closeConn().then(loadFeed).catch(err => console.error(err))
  }, [])

  return posts
    ? <PostsList
        posts={posts}
        header={<h2>
          {pluralize(posts.length, 'post in your feed')}
        </h2>}
      />
    : <Loading label='Calculate feed...'/>;
}