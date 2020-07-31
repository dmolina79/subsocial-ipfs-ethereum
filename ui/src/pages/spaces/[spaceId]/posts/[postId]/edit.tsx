import dynamic from 'next/dynamic'

const EditSpace = dynamic(import('../../../../../components/posts/PostEditor').then(x => x.EditPost as any), { ssr: false })

export default EditSpace