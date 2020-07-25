import React, { useState } from 'react'
import { Form, Button, Input } from 'antd';
import { PostDto, RegularPostContent } from './types';
import { useOrbitDbContext } from '../orbitdb';
import { useRouter } from 'next/dist/client/router';


const { TextArea } = Input;

type EditorProps = {
  content?: RegularPostContent,
  onChange: (content: RegularPostContent) => void,
  onSubmit: () => void,
  submitting?: boolean
}

const Editor = ({ onChange, onSubmit, submitting, content: { title, body } = { } as RegularPostContent }: EditorProps) => (
  <>
    <Form.Item label='Title'>
      <Input placeholder='Enter title for your new post' value={title} onChange={(e) => onChange({ title: e.target.value, body })} required/>
    </Form.Item>
    <Form.Item label='Post'>
      <TextArea rows={4} onChange={(e) => onChange({ body: e.target.value, title })} value={body} required/>
    </Form.Item>
    <Form.Item>
      <Button placeholder='Enter description for your new post' htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Post
      </Button>
    </Form.Item>
  </>
);

export const PostEditor = () => {
  const [ submitting, setSubmitting ] = useState(false)
  const [ content, setContent ] = useState<RegularPostContent>()

  const { owner } = useOrbitDbContext()
  const { postStore, postTotalCounter } = useOrbitDbContext()

  const router = useRouter()

  const addPost = async (content: RegularPostContent) => {
    await postTotalCounter.inc()
    const nextPostId = postTotalCounter.value.toString()
    console.log(nextPostId)
    const post: PostDto = {
      id: nextPostId,
      owner,
      created: {
        account: owner,
        time: new Date().toUTCString()
      },
      content: content
    }
    await postStore.put(post)

    router.push(`/posts/${nextPostId}`)
  }

  const handleSubmit = async () => {
    if (!content) {
      return;
    }

    setSubmitting(true);
    
    await addPost(content)
    
    setSubmitting(false)
    setContent(undefined)
  };

  const handleChange = (content: RegularPostContent) => {
    setContent(content)
  };

  return <Editor
    onChange={handleChange}
    onSubmit={handleSubmit}
    content={content}
    submitting={submitting}
  />
}

export default PostEditor