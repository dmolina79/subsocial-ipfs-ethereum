import React, { useState, useEffect } from "react";
import { PostDto } from "./posts/types";
import { PostsList } from "./posts/Posts";
import { Loading, getIdFromFullPath } from "./utils";
import { useOrbitDbContext, openStore, openIdCounter } from "./orbitdb";
import EventStore from "orbit-db-eventstore";
import { useFollowSpaceStoreContext } from "./spaces/FollowSpaceContext";
import { PostStore } from "./posts/PostsContext";

type Feed = EventStore<PostDto>;

export const Feed = () => {
  const { followSpaceStore } = useFollowSpaceStoreContext();
  const { orbitdb } = useOrbitDbContext();
  const [posts, setPosts] = useState<PostDto[] | undefined>();

  useEffect(() => {
    const loadFeed = async () => {
      const followSpace = followSpaceStore.get("");

      const posts: PostDto[] = [];
      console.log("Init a feed");

      for (const { spacePath, lastKnownPostId, links } of followSpace) {
        const postStore = await openStore<PostStore>(orbitdb, links.postStore);
        const postIdCounter = await openIdCounter(
          orbitdb,
          links.postIdCounter || ""
        );

        await postStore.load();
        await postIdCounter.load();

        const { value: lastPostId } = postIdCounter;

        if (lastKnownPostId < lastPostId) {
          const ids: string[] = [];
          for (let i = lastKnownPostId + 1; i <= lastPostId; i++) {
            ids.push(i.toString());
          }

          posts.push(
            ...postStore
              .query(({ path }) => ids.includes(getIdFromFullPath(path)))
              .sort((a, b) => b.created.time - a.created.time)
          );

          followSpaceStore.put({
            spacePath,
            lastKnownPostId: lastPostId,
            links,
          });
        }

        postStore.close();
        postIdCounter.close();

        console.log("Success calculate feed");
      }

      setPosts([...posts]);
    };
    loadFeed().catch((err) => {
      console.error(err);
      setPosts([]);
    });
  }, []);

  return posts ? (
    <PostsList posts={posts} header={<h2>My feed</h2>} />
  ) : (
    <Loading label="Preparing your feed..." />
  );
};
