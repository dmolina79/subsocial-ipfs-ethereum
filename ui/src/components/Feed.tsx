import React, { useState, useEffect } from "react";
import { PostDto } from "./posts/types";
import { PostsList, PostWithSpace } from "./posts/Posts";
import { Loading, getIdFromFullPath, parseFullPath } from "./utils";
import { useOrbitDbContext, openStore, openIdCounter } from "./orbitdb";
import EventStore from "orbit-db-eventstore";
import { useFollowSpaceStoreContext } from "./spaces/FollowSpaceContext";
import { PostStore } from "./posts/PostsContext";
import { SpaceStore } from "./spaces/SpaceContext";

type Feed = EventStore<PostDto>;

export const Feed = () => {
  const { followSpaceStore } = useFollowSpaceStoreContext();
  const { orbitdb } = useOrbitDbContext();
  const [data, setData] = useState<PostWithSpace[] | undefined>();

  useEffect(() => {
    const loadFeed = async () => {
      const followSpace = followSpaceStore.get("");

      const data: PostWithSpace[] = [];
      console.log("Init a feed");

      for (const { spacePath, links } of followSpace) {

        const { path } = parseFullPath(spacePath)
        const spaceStore = await openStore<SpaceStore>(orbitdb, path)
        await spaceStore.load()
        const space = await spaceStore.get(spacePath).pop()

        const postStore = await openStore<PostStore>(orbitdb, links.postStore);
        const postIdCounter = await openIdCounter(
          orbitdb,
          links.postIdCounter || ""
        );

        await postStore.load();
        await postIdCounter.load();

        const { value: lastPostId } = postIdCounter;

        const ids: string[] = [];
        for (let i = 1; i <= lastPostId; i++) {
          ids.push(i.toString());
        }

        const posts = postStore
            .query(({ path }) => ids.includes(getIdFromFullPath(path)))
            .sort((a, b) => b.created.time - a.created.time)

        space && data.push(...posts.map(post => ({ post, space })))

        await postStore.close();
        await postIdCounter.close();
        await spaceStore.close()

        console.log("Success calculate feed");
      }

      setData([...data]);
    };
    loadFeed().catch((err) => {
      console.error(err);
      setData([]);
    });
  }, [ false ]);

  console.log(data)

  return data ? (
    <PostsList data={data} header={<h2>My feed</h2>} />
  ) : (
    <Loading label="Preparing your feed..." />
  );
};
