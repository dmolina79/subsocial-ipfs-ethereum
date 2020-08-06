import { List } from 'antd';
import React, { useEffect, useState } from 'react';
import { ViewSpace } from './ViewSpace';
import { SpaceDto } from './types';
import { getPathAndId, getIdFromFullPath, Loading } from '../utils';
import { useSpaceStoreContext, SpaceStore } from './SpaceContext';
import { useFollowSpaceStoreContext } from './FollowSpaceContext';
import { openStore, useOrbitDbContext } from '../orbitdb';

type SpaceListProps = {
  spaces: SpaceDto[],
  header?: React.ReactNode
}

export const SpaceList = ({ spaces, header }: SpaceListProps) => {

  return <List
      size="large"
      itemLayout='vertical'
      header={header}
      dataSource={spaces}
      renderItem={space => <ViewSpace space={space} isPreview />}
    />
}

export const Spaces = () => {
  const { spaceStore } = useSpaceStoreContext()
  const [ spaces, setSpace ] = useState<SpaceDto[] | undefined>()

  useEffect(() => {
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
          Spaces ({spaces.length})
        </h2>}
      />
    : <Loading label='Loading spaces...' />
}

export const FollowSpaces = () => {
  const { orbitdb } = useOrbitDbContext()
  const { followSpaceStore } = useFollowSpaceStoreContext()
  const [ spaces, setSpace ] = useState<SpaceDto[] | undefined>()

  useEffect(() => {
    if (spaces?.length) return

    const loadSpace = async () => {
      const followSpaces = await followSpaceStore.get('')

      const spaces: SpaceDto[] = [] 
      const spacesIdsByPath = new Map<string, string[]>()
      const paths = new Set<string>()

      followSpaces.forEach(({ spacePath }) => {
        const { path, id } = getPathAndId(spacePath)
        paths.add(path)
        const ids = spacesIdsByPath.get(path) || []
        spacesIdsByPath.set(path, [ ...ids, id ])
      })

      for (const spacePath of paths) {
        const spaceStore = await openStore<SpaceStore>(orbitdb, spacePath)
        await spaceStore.load()
        const ids = spacesIdsByPath.get(spacePath)
        ids && spaces.push(...spaceStore.query(({ path }) => ids.includes(getIdFromFullPath(path))))
        await spaceStore.close()
      }

      setSpace(spaces)
    }
    loadSpace().catch(err => console.error(err))
  }, [])

  return spaces
    ? <SpaceList
        spaces={spaces}
        header={<h2>My subscriptions</h2>}
      />
    : <Loading label='Loading subscriptions...' />
}

