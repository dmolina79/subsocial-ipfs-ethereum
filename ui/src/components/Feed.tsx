import React, { useState, useEffect } from 'react';
import { openPostStore, getPostIdCounterAddress } from './posts/PostsContext';
import { PostDto } from './posts/types';
import { PostsList } from './posts/Posts';
import { pluralize } from './utils';
import { useSpaceStoreContext } from './spaces/SpaceContext';
import { useOrbitDbContext } from './orbitdb';
import EventStore from 'orbit-db-eventstore';
import CounterStore from 'orbit-db-counterstore';

type Feed = EventStore<PostDto>

export const Feed = () => {
  const { followSpaceStore } = useSpaceStoreContext()
  const { orbitdb } = useOrbitDbContext()
  const [ posts, setPosts ] = useState<PostDto[] | undefined>()

  useEffect(() => {
    if (posts?.length) return

    const loadFeed = async () => {
      const followSpace = followSpaceStore.get('')

      const feed: Feed = await orbitdb.eventlog('feed')

      await feed.load()

      const createFeed = async () => {
        for (const { spaceId, lastKnownPostId } of followSpace) {
          const postStore = await openPostStore(orbitdb, spaceId)
          const postIdCounter = await orbitdb.open(getPostIdCounterAddress(spaceId), {
            create: true,
            type: 'counter'
          }) as CounterStore


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

        return feed.iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value)
      }

      const posts = await createFeed()
      setPosts(posts)

      feed.close()
    }
    loadFeed().catch(err => console.error(err))
  }, [])

  return posts
    ? <PostsList
        posts={posts}
        header={<h2>
          {pluralize(posts.length, 'post in your feed')}
        </h2>}
      />
    : <em>Calculating feed...</em>;
}