import dynamic from 'next/dynamic'
const NewSpace = dynamic(import("../../../../components/spaces/SpaceEditor"), { ssr: false });

export default NewSpace