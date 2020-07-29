import dynamic from 'next/dynamic'
const PostEditor = dynamic(import("../../components/posts/PostEditor"), { ssr: false });

export default () => <PostEditor />