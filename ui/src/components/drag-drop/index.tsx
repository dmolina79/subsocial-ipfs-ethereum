import * as React from 'react';
import { useBucketContext } from '../buckets/BucketsContext';
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer'
import { DragDrop, Accept } from './Dragger';
const Hash = require('ipfs-only-hash')

type BucketDragDropProps = {
  onUpload: (url: string) => void,
  accept: Accept,
  onlyPreview?: boolean
}

export const BucketDragDrop = ({ onUpload, accept, onlyPreview }: BucketDragDropProps) => {
  const { buckets, bucketKey, rootPath } = useBucketContext()

  /**
   * processAndStore resamples the image and extracts the metadata. Next, it
   * calls insertFile to store each of the samples plus the metadata in the bucket.
   * @param image 
   * @param path 
   * @param name 
   * @param limits 
   */
  const processAndStore = async (image: File | Blob, path: string, name: string, limits?: {maxWidth: number, maxHeight: number}): Promise<any> => {
    const finalImage = limits ? await readAndCompressImage(image, limits) : image
    const location = `${path}-${name}`
    await buckets.pushPath(bucketKey, location, finalImage.stream())
    const fullPath = `${rootPath}/${location}`
    return fullPath
  }

  const onDrop = async (file: File | Blob) => {
    const preview = {
      maxWidth: 800,
      maxHeight: 400
    }

    const [ typeContent, format ] = file.type.split('/')

    const fileStream = await file.text()
    const cid = await Hash.of(fileStream)

    const path = `${typeContent}s/${cid}`
    let finalPath = !onlyPreview ? await processAndStore(file, path, `original.${format}`) : undefined
    if (!finalPath && typeContent === 'image') {
      finalPath = await processAndStore(file, path, `preview.${format}`, preview)
    }

    console.log(finalPath)
    onUpload(finalPath)
  }

  return <DragDrop onChange={onDrop} accept={accept} />
}
