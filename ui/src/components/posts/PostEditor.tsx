import React, { useState, useEffect } from 'react'
import { Form, Input, Empty, Button, notification, Tabs, Checkbox } from 'antd'
import { useRouter } from 'next/router'
import { PostDto, AllValues, CommentsLinks } from './types'
import { SpaceDto } from '../spaces/types'
import TextArea from 'antd/lib/input/TextArea'
import { maxLenError, minLenError, TITLE_MIN_LEN, TITLE_MAX_LEN, DESC_MAX_LEN, getIdFromFullPath, pathToDbName } from '../utils'
import { useOrbitDbContext } from '../orbitdb'
import { usePostStoreContext } from './PostsContext'
import { BucketDragDrop } from '../drag-drop'
import { FormInstance } from 'antd/lib/form'
import { withLoadSpaceFromMyStore } from '../spaces/ViewSpace'
import { useSpaceStoreContext } from '../spaces/SpaceContext'
import { createCommentStore, createCommentCounter } from '../comments/СommentContext'
import { useMyDomain } from '../auth/AuthContext'
import { encryptContent, encryptSecretForApi, web3 } from '../../utils'
import axios from 'axios'
import { StoreSecretParams } from '../../pages/api/secrets/store'
import { useMyEthAddress } from '../eth'

const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

type Content = AllValues

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
    return { ...post.content }
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
  const owner = useMyDomain()
  const authorEthAddress = useMyEthAddress()

  const { orbitdb } = useOrbitDbContext()
  const { spacesPath } = useSpaceStoreContext()
  const { postStore, nextPostId, postsPath } = usePostStoreContext()

  if (!space) return <Empty description='Space not found' />

  const initialValues = getInitialValues({ space, post })

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const goToView = (postId: string) => {
    router.push(`${postsPath}/${postId}`)
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

  const createCommentStoreLinks = async (postId: string): Promise<CommentsLinks> => {
    const postPath = pathToDbName(postsPath, postId)

    const commentStore = await createCommentStore(orbitdb, postPath)
    const commentStoreLink = commentStore.id
    await commentStore.close()

    const addCounter = await createCommentCounter(orbitdb, postPath, 'add')
    const addCounterLink = addCounter.id
    await addCounter.close()

    const delCounter = await createCommentCounter(orbitdb, postPath, 'del');
    const delCounterLink = delCounter.id
    await delCounter.close()

    return {
      addCounter: addCounterLink,
      delCounter: delCounterLink,
      commentStore: commentStoreLink
    }
  }

  /** Returns postId */
  const addPost = async (): Promise<string> => {

    let postId = post ? getIdFromFullPath(post?.path) : '0'

    const getMaybeEncryptedContent = async (postPath: string): Promise<Content> => {
      const values = getFieldValues()
      const content = { ...(values as Content) }
      let { body, ...contentWoBody } = content

      if (values.encrypted !== true || !body) {
        return content
      }

      const contentEnc = encryptContent(body)
      const { encryptedContent, secret, nonce } = contentEnc
      const encryptionNonce = nonce
      body = encryptedContent

      const secretEnc = encryptSecretForApi(secret)
      const secretHash = web3.utils.keccak256(secret)
      const signedSecretHash = await web3.eth.sign(secretHash, authorEthAddress)
      
      const apiParams: StoreSecretParams = {
        postId: postPath,
        authorEthAddress,
        authorPublicKey: secretEnc.publicKey,
        nonce: secretEnc.nonce,
        encryptedSecret: secretEnc.encryptedSecret,
        signedSecretHash
      }
    
      // console.log('contentEnc', contentEnc)
      // console.log('secretEnc', secretEnc)
      // console.log('api params', apiParams)

      await axios({
        // method: 'post',
        url: '/api/secrets/store',
        params: apiParams
      })

      const contentForOrbit = { body, encryptionNonce, secretHash, ...contentWoBody }

      console.log('Post content for Orbit', contentForOrbit)

      return contentForOrbit
    }

    let newPost: PostDto;

    if (post) {
      const content = await getMaybeEncryptedContent(post.path)
      newPost = { ...post, content } as PostDto
    } else {
      await nextPostId.inc()
      postId = nextPostId.value.toString()
      const path = `${postsPath}/${postId}`
      const spaceId = router.query.spaceId as string
      const spacePath = `${spacesPath}/${spaceId}`

      const content = await getMaybeEncryptedContent(path)
      const links = await createCommentStoreLinks(postId)

      newPost = {
        path,
        spacePath,
        owner,
        created: {
          account: owner,
          time: new Date().getTime()
        },
        content,
        links
      }

      console.log('New post:', newPost)
    }

    await postStore.put(newPost)

    return postId 
  }

  const onSubmit = async () => {
    const isValid = await isValidForm(form)
    if (isValid) {
      setSubmitting(true)
      const postId = await addPost()
      setSubmitting(false)
      goToView(postId) // TODO uncomment when post encryption fixed
    }
  }

  return <Form form={form} initialValues={initialValues} {...layout}>
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
        name={fieldName('encrypted')}
        valuePropName='checked'
        label='Encryption'
      >
        <Checkbox>Encrypt content of this post</Checkbox>
      </Form.Item>

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
        <Button htmlType="submit" loading={submitting} disabled={submitting} onClick={onSubmit} type="primary">
          Create post
        </Button>
      </div>
  </Form>
}

function LoadPostThenEdit (props: FormProps) {
  const { postId } = useRouter().query
  const [ isLoaded, setIsLoaded ] = useState(false)
  const [ post, setPost ] = useState<PostDto>()

  const myAddress = useMyDomain()
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

  return <>
    <h2>Edit post</h2>
    <InnerForm {...props} post={post} isTitle={!!title} isImg={!!image} isVideo={!!video} />
  </>
}

export const NewPost = withLoadSpaceFromMyStore((props) => {
  return (<>
    <h2>New post</h2>
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
  </>
);
})

export const EditPost = withLoadSpaceFromMyStore(LoadPostThenEdit)

export default withLoadSpaceFromMyStore(NewPost)
