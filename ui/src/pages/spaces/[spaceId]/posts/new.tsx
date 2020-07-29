import dynamic from 'next/dynamic'
const NewPost = dynamic(import("../../../../components/posts/PostEditor"), { ssr: false });

export default NewPost