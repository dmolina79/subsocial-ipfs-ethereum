import { PostDto, AllValues } from "../posts/types";
import OrbitDB from "orbit-db";
import { openStore, openIdCounter } from "../orbitdb";
import { SpaceStore } from "../spaces/SpaceContext";
import { PostStore } from "../posts/PostsContext";
import { CommentValue } from "../comments/types";
import { SpaceDto, SpaceContent } from "../spaces/types";
import { getOwner } from "./utils";

type CommentJson = {
  body: string;
  replies?: string[];
};

type PostJson = {
  post: AllValues;
  comments: CommentJson[];
};

type SpaceJson = {
  space: SpaceContent;
  posts: PostJson[];
};

export type SpacesJson = {
  spaces: SpaceJson[];
};

const mock: SpacesJson = {
  spaces: [
    {
      space: {
        title: "Test filler title",
        desc: "Test filler desc",
        avatar: null,
      },
      posts: [
        {
          post: {
            body: "Test filler status post",
          },
          comments: [
            {
              body: "Test root comment",
              replies: ["Test comment 1", "Test comment 2", "Test comment 3"],
            },
          ],
        },
      ],
    },
  ],
};

export const importDataFromJson = async (
  orbitdb: OrbitDB,
  { spaces }: SpacesJson = mock,
  owner: string
) => {
  const spaceCounter = await openIdCounter(orbitdb, "next_space_id");
  await spaceCounter.load();

  console.log('Start with id:', spaceCounter.value)

  const spacesStore = await openStore<SpaceStore>(
    orbitdb,
    "spaces"
  );
  const spacesPath = spacesStore.id;

  for (let spaceIndex = 0; spaceIndex < spaces.length; spaceIndex++) {
    const { space, posts } = spaces[spaceIndex];

    await spaceCounter.inc();
    const spaceId = spaceCounter.value;

    const postsCount = posts.length;

    const spacePath = `${spacesPath}/${spaceId}`;
    const postIdCouter = await openIdCounter(
      orbitdb,
      `spaces/${spaceId}/next_post_id`
    );
    await postIdCouter.load();

    const postCounterLink = postIdCouter.id;

    const postsPath = `spaces/${spaceId}/posts`;

    const postStore = await openStore<PostStore>(orbitdb, postsPath);
    const postStoreLink = postStore.id;

    for (let postIndex = 0; postIndex < postsCount; postIndex++) {
      const { post, comments } = posts[postIndex];

      await postIdCouter.inc();
      const postId = postIdCouter.value;
      let commentCount = comments.length;
      const commentIdCouter = await openIdCounter(
        orbitdb,
        `spaces/${spaceId}/posts/${postId}/add_comment_counter`
      );
      commentIdCouter.inc(commentCount);
      const commentCounterLink = commentIdCouter.id;

      const commentStore = await orbitdb.feed(
        `${postsPath}/${postId}/comments`
      );

      for (const { body, replies } of comments) {
        const newComment: CommentValue = {
          owner: getOwner(),
          body: body?.trim(),
          created: {
            account: owner,
            time: new Date().getTime(),
          },
          parentId: null,
        };
        const parentId = await commentStore.add(newComment);

        if (replies) {
          for (const reply of replies) {
            const newReply: CommentValue = {
              owner: getOwner(),
              body: reply?.trim(),
              created: {
                account: owner,
                time: new Date().getTime(),
              },
              parentId: parentId,
            };
            await commentStore.add(newReply);
            await commentIdCouter.inc();
          }
        }
      }

      await commentIdCouter.close();
      await commentStore.close();

      const newPost: PostDto = {
        content: post,
        created: {
          account: owner,
          time: new Date().getTime(),
        },
        owner,
        path: `${postStoreLink}/${postId}`,
        spacePath,
        links: {
          addCounter: commentCounterLink,
          commentStore: commentStore.id,
        },
      };

      await postStore.put(newPost);
    }

    await postStore.close();

    const newSpace: SpaceDto = {
      content: space,
      created: {
        account: owner,
        time: new Date().getTime(),
      },
      owner,
      path: spacePath,
      links: {
        postStore: postStoreLink,
        postIdCounter: postCounterLink,
      },
    };

    await spacesStore.put(newSpace);
  }
};
