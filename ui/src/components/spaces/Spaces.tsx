import { List, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewSpace } from './ViewSpace';
import { SpaceDto } from './types';
import { pluralize } from '../utils';
import Link from 'next/link';
import { useSpaceStoreContext } from './SpaceContext';

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
      renderItem={space => <ViewSpace space={space} isPreview />}
    />
    : <em>Loading spaces...</em>;
}

const DynamicSpace = () => {
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

export default DynamicSpace