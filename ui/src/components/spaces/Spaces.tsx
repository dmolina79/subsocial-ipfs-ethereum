import { List, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewSpace } from './ViewSpace';
import { SpaceDto } from './types';
import { pluralize } from '../utils';
import Link from 'next/link';
import { useSpaceStoreContext } from './SpaceContext';
import { PostStoreProvider } from '../posts/PostsContext';

type SpaceListProps = {
  spaces: SpaceDto[],
  header?: React.ReactNode
}

export const SpaceList = ({ spaces, header }: SpaceListProps) => {

  return spaces
    ? <List
      size="large"
      itemLayout='vertical'
      header={header}
      dataSource={spaces}
      renderItem={space => <PostStoreProvider spaceId={space.id}><ViewSpace space={space} isPreview /></PostStoreProvider>}
    />
    : <em>Loading spaces...</em>;
}

export const MySpaces = () => {
  const { spaceStore, nextSpaceId: { value: count } } = useSpaceStoreContext()
  const [ spaces, setSpace ] = useState<SpaceDto[] | undefined>()

  useEffect(() => {
    if (spaces?.length) return

    const loadSpace = async () => {
      const spaces = await spaceStore.get('')
      setSpace(spaces)
    }
    loadSpace().catch(err => console.error(err))
  }, [])

  return spaces
    ? <SpaceList
        spaces={spaces}
        header={<h2 className='d-flex justify-content-between'>
          {pluralize(count, 'space')}
          <Button type='primary' ghost>
            <Link href='/spaces/new'>
              <a>New space</a>
            </Link>
          </Button>
        </h2>}
      />
    : <em>Loading spaces...</em>;
}

export const FollowSpaces = () => {
  const { followSpaceStore, spaceStore, nextSpaceId: { value: count } } = useSpaceStoreContext()
  const [ spaces, setSpace ] = useState<SpaceDto[] | undefined>()

  useEffect(() => {
    if (spaces?.length) return

    const loadSpace = async () => {
      const followSpaces = await followSpaceStore.get('')

      const spaces: SpaceDto[] = []  
      followSpaces.forEach(async ({ spaceId }) => {
        await spaceStore.load()
        const space = await spaceStore.get(spaceId).pop()
        space && spaces.push(space)
      })

      setSpace(spaces)
    }
    loadSpace().catch(err => console.error(err))
  }, [])

  return spaces
    ? <SpaceList
        spaces={spaces}
        header={<h2>{pluralize(count, 'followed space')}</h2>}
      />
    : <em>Loading spaces...</em>;
}

// export const Space: NextPage<SpaceListProps> = (props) => <SpaceList {...props} />

// Space.getInitialProps = async (props): Promise<any> => {
//   const spaceStore = await getSpaceStore()
//   const spaces = await spaceStore.get('')

//   if (!spaces) {
//     return return404(props)
//   }

//   return { 
//     spaces
//   }
// }
