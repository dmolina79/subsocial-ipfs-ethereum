import dynamic from 'next/dynamic'
const EditSpace = dynamic(import('../../../../../components/spaces/SpaceEditor').then(x => x.EditSpace as any), { ssr: false })

export default EditSpace