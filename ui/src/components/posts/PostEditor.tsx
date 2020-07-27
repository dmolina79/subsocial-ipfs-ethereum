import React, { useState, useEffect } from 'react'
import { Form, Input, Empty, Button } from 'antd'
import { useRouter } from 'next/router'
import { PostDto, RegularPostContent } from './types'
import { Space } from '../spaces/types'
import TextArea from 'antd/lib/input/TextArea'
import { maxLenError, minLenError } from '../utils'
import { useOrbitDbContext } from '../orbitdb'

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

const BODY_MAX_LEN = 20_000

const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 21 },
};

type Content = RegularPostContent

type FormValues = Partial<Content> & {
  spaceId?: string
}

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps ={
  post?: PostDto,
  space?: Space
}

function getInitialValues ({  space, post }: FormProps): FormValues {
  if (space && post) {
    const spaceId = space.id
    return { ...post.content, spaceId }
  }
  return {}
}

export function InnerForm (props: FormProps) {
  const { space = { id: '1' }, post } = props
  const [ submitting, setSubmitting ] = useState(false)
  const [ form ] = Form.useForm()
  const router = useRouter()

  const { postStore, nextPostId, owner } = useOrbitDbContext()

  if (!space) return <Empty description='Space not found' />

  const isNew = !post

  const editType = isNew ? 'New' : 'Edit'

  const spaceId = space.id
  const initialValues = getInitialValues({ space, post })

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const fieldValuesToContent = (): Content => {
    const { title, body, image = null } = getFieldValues()
    return { title, body, image } as Content
  }

  const goToView = (postId: string) => {
    router.push('/posts/[postId]', `/posts/${postId}`)
      .catch(err => console.error(`Failed to redirect to a post page. ${err}`))
  }

  const onBodyChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setFieldsValue({ [fieldName('body')]: e.target.value })
  }

  const addPost = async (content: RegularPostContent) => {
    isNew && await nextPostId.inc()
    const postId = nextPostId.value.toString()

    const post: PostDto = {
      id: postId,
      spaceId: spaceId,
      owner,
      created: {
        account: owner,
        time: new Date().toUTCString()
      },
      content: content
    }
    
    setSubmitting(true)

    await postStore.put(post)

    setSubmitting(false)

    goToView(postId)
  }

  const onSubmit = () => addPost(fieldValuesToContent())

  return <>
    <h2>{editType} post</h2>
    <Form form={form} initialValues={initialValues} {...layout}>
      <Form.Item
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
      </Form.Item>

      <Form.Item
        name={fieldName('image')}
        label='Image URL'
        hasFeedback
        rules={[
          { type: 'url', message: 'Should be a valid image URL.' }
        ]}
      >
        <Input type='url' placeholder='Image URL' />
      </Form.Item>

      <Form.Item
        name={fieldName('body')}
        label='Post'
        hasFeedback
        rules={[
          { required: true, message: 'Post body is required.' },
          { max: BODY_MAX_LEN, message: maxLenError('Post body', BODY_MAX_LEN) }
        ]}
      >
        <TextArea rows={5} onChange={onBodyChanged} />
      </Form.Item>
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

// export function withLoadSpaceFromUrl<Props> (
//   Component: React.ComponentType<Props>
// ) {
//   return function (props: Props): React.ReactElement<Props> {

//     const id = useRouter().query.spaceId as string
//     const [ isLoaded, setIsLoaded ] = useState(false)
//     const [ loadedData, setLoadedData ] = useState({})

//     if (!isLoaded) return <Loading label='Loading the space...' />

//     const { space } = loadedData
//     if (!space) return <NoData description='Space not found' />

//     return <Component {...props} space={space} />
//   }
// }

function LoadPostThenEdit (props: FormProps) {
  const { postId } = useRouter().query
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ post, setPost ] = useState<PostDto>()

  const { postStore, owner: myAddress } = useOrbitDbContext()

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

  return <InnerForm {...props} post={post} />
}

export const EditPost = LoadPostThenEdit

export const NewPost = InnerForm

export default NewPost
