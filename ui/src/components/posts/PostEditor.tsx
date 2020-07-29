import React, { useState, useEffect } from 'react'
import { Form, Input, Empty, Button, notification, Tabs } from 'antd'
import { useRouter } from 'next/router'
import { PostDto, PostContent, AllValues } from './types'
import { SpaceDto } from '../spaces/types'
import TextArea from 'antd/lib/input/TextArea'
import { maxLenError, minLenError, TITLE_MIN_LEN, TITLE_MAX_LEN, DESC_MAX_LEN } from '../utils'
import { useOrbitDbContext } from '../orbitdb'
import { usePostStoreContext, withPostStoreProvider } from './PostsContext'
import { BucketDragDrop } from '../drag-drop'
import { FormInstance } from 'antd/lib/form'
import { withLoadSpaceFromUrl } from '../spaces/ViewSpace'

const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

type Content = PostContent

type FormValues = AllValues & {
  spaceId?: string
}

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps ={
  post?: PostDto,
  space: SpaceDto,
  isTitle?: boolean,
  isImg?: boolean,
  isVideo?: boolean
}

function getInitialValues ({  space, post }: FormProps): FormValues {
  if (space && post) {
    const spaceId = space.id
    return { ...post.content, spaceId }
  }
  return {}
}

export const isValidForm = async (form: FormInstance) => {
  try {
    await form.validateFields()
    const isChanged = form.isFieldsTouched()
    if (!isChanged) {
      notification.info({
        message: 'Nothing to update',
        description: 'Form has not been changed'
      })
    }
    return isChanged
  } catch (err) {
    // Form is invalid
    notification.error({
      message: 'Form is invalid',
      description: 'Fix form errors and try again'
    })
    return false
  }
}

export function InnerForm (props: FormProps) {
  const { space, post, isTitle, isImg, isVideo } = props
  const [ submitting, setSubmitting ] = useState(false)
  const [ form ] = Form.useForm()
  const router = useRouter()

  const { owner } = useOrbitDbContext()
  const { postStore, nextPostId } = usePostStoreContext()

  if (!space) return <Empty description='Space not found' />

  const isNew = !post

  const editType = isNew ? 'New' : 'Edit'

  const spaceId = space.id
  const initialValues = getInitialValues({ space, post })

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  const goToView = (postId: string) => {
    router.push('/spaces/[spaceId]/posts/[postId]', `/spaces/${spaceId}/posts/${postId}`)
      .catch(err => console.error(`Failed to redirect to a post page. ${err}`))
  }

  const onBodyChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setFieldsValue({ [fieldName('body')]: e.target.value })
  }

  const onUpload = (url: string, name: 'image' | 'video') => {
    form.setFieldsValue({ [fieldName(name)]: url })
  }

  const onImageUpload = (url: string) => {
    onUpload(url, 'image')
  }

  const onVideoUpload = (url: string) => {
    onUpload(url, 'video')
  }

  const addPost = async (content: PostContent) => {
    isNew && await nextPostId.inc()
    const postId = nextPostId.value.toString()

    const post: PostDto = {
      id: postId,
      spaceId: spaceId,
      owner,
      created: {
        account: owner,
        time: new Date().getTime()
      },
      content: content
    }
    
    setSubmitting(true)

    await postStore.put(post)

    setSubmitting(false)

    goToView(postId)
  }

  const onSubmit = async () => {
    const isValid = await isValidForm(form)
    if (isValid) {
      addPost(fieldValuesToContent())
    }
  }

  return <>
    <h2>{editType} post</h2>
    <Form form={form} initialValues={initialValues} {...layout}>
      {isTitle && <Form.Item
        name={fieldName('title')}
        label='Post title'
        hasFeedback
        rules={[
          { required: true, message: 'Post title is required.' },
          { min: TITLE_MIN_LEN, message: minLenError('Post title',TITLE_MIN_LEN) },
          { max: TITLE_MAX_LEN, message:  maxLenError('Post title',TITLE_MAX_LEN) }
        ]}
      >
        <Input placeholder='Optional: A title of your post' />
      </Form.Item>}

      <Form.Item
        name={fieldName('body')}
        label='Post'
        hasFeedback
        rules={[
          { required: true, message: 'Post body is required.' },
          { max: DESC_MAX_LEN, message: maxLenError('Post body', DESC_MAX_LEN) }
        ]}
      >
        <TextArea rows={5} onChange={onBodyChanged} />
      </Form.Item>

      {(isImg || isVideo) && <Form.Item
        name={fieldName('image')}
        label={isVideo ? 'Preview' : 'Image'}
        hasFeedback
        rules={[
          { required: true, message: 'Post image is required.' }
        ]}
      >
        <BucketDragDrop onUpload={onImageUpload} accept='image' />
      </Form.Item>}

      {isVideo && <Form.Item
        name={fieldName('video')}
        label='Video'
        hasFeedback
        rules={[
          { required: true, message: 'Post video is required.' }
        ]}
      >
        <BucketDragDrop onUpload={onVideoUpload} accept='video' />
      </Form.Item>}

      <div className='RigthButtonGroup'>
        <Button onClick={() => form.resetFields()}>
          Reset form
        </Button>
        <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
          New Post
        </Button>
      </div>
      {/* // TODO impl Move post to another space. See component SelectSpacePreview */}
    </Form>
  </>
}

function LoadPostThenEdit (props: FormProps) {
  const { postId } = useRouter().query
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ post, setPost ] = useState<PostDto>()

  const { owner: myAddress } = useOrbitDbContext()
  const { postStore } = usePostStoreContext()

  useEffect(() => {
    const loadPost = async () => {
      const post = await postStore.get(postId).pop()
      post && setPost(post)
      setIsLoaded(true)
    }
    loadPost().catch(err => console.error('Failed load post from OrbitDB:', err))
  })

  if (!isLoaded) return <em>Loading the post...</em>

  if (!post) return <Empty description='Post not found' />

  const isOwner = myAddress === post.owner
  if (!isOwner) return <Empty description='You do not have permission to edit this post' />

  const { content: { title, image, video } } = post

  return <InnerForm {...props} post={post} isTitle={!!title} isImg={!!image} isVideo={!!video} />
}

export const NewPost = withLoadSpaceFromUrl((props) => {
  return (
    <Tabs defaultActiveKey="status" type="card" size='large'>
      <TabPane tab="Status" key="status">
        <InnerForm {...props} />
      </TabPane>
      <TabPane tab="Article" key="article">
        <InnerForm {...props} isTitle />
      </TabPane>
      <TabPane tab="Image" key="image">
        <InnerForm {...props} isImg />
      </TabPane>
      <TabPane tab="Video" key="video">
        <InnerForm {...props} isVideo isTitle />
      </TabPane>
    </Tabs>
);
})

export const EditPost = withPostStoreProvider(withLoadSpaceFromUrl(LoadPostThenEdit))

export default withPostStoreProvider(withLoadSpaceFromUrl(NewPost))
