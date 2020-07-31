import { PostStore } from "../posts/PostsContext"
import CounterStore from "orbit-db-counterstore"
import { CommentStore } from "../comments/СommentContext"
import { SpaceStore } from "../spaces/SpaceContext"
import { FollowSpaceStore } from "../spaces/FollowSpaceContext"
import OrbitDB from "orbit-db"

type OrbitConst = {
  orbitDb?: OrbitDB,
  followSpaceStore?: FollowSpaceStore,
  spaceStore?: SpaceStore,
  nextSpaceId?: CounterStore,
  postStore?: PostStore,
  nextPostId?: CounterStore,
  commentStore?: CommentStore,
  addCommentCount?: CounterStore,
  delCommentCount?: CounterStore
}

export const orbitConst: OrbitConst = {}
