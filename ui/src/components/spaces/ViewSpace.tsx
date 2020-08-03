import * as React from 'react';
import { useRouter } from 'next/router';
import { SpaceDto } from './types';
import { Loading, IconText, DEFAULT_PATH } from '../utils';
import { Avatar, Empty, Card } from 'antd';
import { NextPage } from 'next';
import { useSpaceStoreContext } from './SpaceContext';
import Jdenticon from 'react-jdenticon';
import DynamicPosts from '../posts/Posts';
import Link from 'next/link';
import { CSSProperties } from 'react';
import Meta from 'antd/lib/card/Meta';
import { EditOutlined } from '@ant-design/icons';
import { FollowSpaceButton } from './FollowSpaceButton';
import { usePostStoreContext } from '../posts/PostsContext';

type ViewSpaceProps = {
  space: SpaceDto,
  isPreview?: boolean
}

type SpaceLinkProps = {
  path: string,
  children: React.ReactNode,
  className?: string,
  style?: CSSProperties
}
const SpaceLink = ({ path, children, className, style }: SpaceLinkProps) => <Link href={`${DEFAULT_PATH}/[spaceId]`} as={path} >
  <a className={className} style={style}>
    {children}
  </a>
</Link>

export const ViewSpace = ({ space, isPreview }: ViewSpaceProps) => {
  const { path, owner, content: { avatar, desc, title } } = space;
  const editLink = <Link href={`${DEFAULT_PATH}/[spaceId]/edit`} as={`${path}/edit`}>
    <a style={{ color: '#8c8c8c', marginRight: '.5rem' }}>
      <IconText icon={EditOutlined} text='Edit' key='space-edit' />
    </a>
  </Link>

  const viewSpace = <Card style={{ width: '100%', marginTop: 16 }} >
    <Meta
      avatar={
        <SpaceLink path={path}>
          <Avatar size={54} src={avatar || undefined} icon={avatar && <Jdenticon value={owner} />} />
        </SpaceLink>
      }
      title={<span className='d-flex justify-content-between'>
        <SpaceLink path={path} style={{ color: '#222' }}>{title}</SpaceLink>
        <span>
          {editLink}  
          <FollowSpaceButton space={space} />
        </span>
      </span>}
      description={desc}
    />
  </Card>

  return viewSpace
}

const SpacePage: NextPage<ViewSpaceProps> = ({ space }: ViewSpaceProps) => {
  return <div className='SpacePage'>
    <ViewSpace space={space} />
    <DynamicPosts spacePath={space.path} />
  </div>
}

export function withLoadSpaceFromUrl (
  Component: React.ComponentType<ViewSpaceProps>
) {
  return function (): React.ReactElement<ViewSpaceProps> {
    const { spaceStore } = useSpaceStoreContext()
    const spaceId = useRouter().query.spaceId as string
    const [ isLoaded, setIsLoaded ] = React.useState(false)
    const { setLinksFromSpace, isReady } = usePostStoreContext()
    const [ space, setSpace ] = React.useState<SpaceDto>()

    React.useEffect(() => {
      const loadSpace = async () => {
        const space = await spaceStore.get(spaceId).pop()
        if (space) {
          setLinksFromSpace(space)
          setSpace(space)
        }
        setIsLoaded(true)
      }
      loadSpace().catch(err => console.error('Failed load space from OrbitDB:', err))
    }, [])

    if (!isLoaded ||isReady) return <Loading label='Loading the space...' />

    if (!space) return <Empty description='Space not found' />

    return <Component space={space} />
  }
}

export const DynamicSpace = withLoadSpaceFromUrl(SpacePage)

export default DynamicSpace