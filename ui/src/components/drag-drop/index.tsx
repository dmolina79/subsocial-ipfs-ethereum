import * as React from 'react';
import { useBucketContext } from '../buckets/BucketsContext';
import { PushPathResult } from '@textile/hub'
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer'
import { DragDrop } from './Dragger';
const Hash = require('ipfs-only-hash')

type BucketDragDropProps = {
  onUploadImage: (url: string) => void
}

export const BucketDragDrop = ({ onUploadImage }: BucketDragDropProps) => {
  const { buckets, bucketKey, rootPath } = useBucketContext()

    /**
   * Pushes files to the bucket
   * @param file 
   * @param path 
   */
  const insertFile = (file: File, path: string): Promise<PushPathResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onabort = () => reject('file reading was aborted')
      reader.onerror = () => reject('file reading has failed')
      reader.onload = () => {
      // Do whatever you want with the file contents
        const binaryStr = reader.result

        buckets.pushPath(bucketKey, path, binaryStr).then((raw) => {
          resolve(raw)
        })
      }
      reader.readAsArrayBuffer(file)
    })
  }

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
    await insertFile(finalImage, location)
    const fullPath = `${rootPath}/${location}`
    return fullPath
  }

  const onDrop = async (file: File | Blob) => {
    const preview = {
      maxWidth: 272,
      maxHeight: 220
    }

    const type = file.type.split('/').pop()

    const fileStream = await file.text()
    const cid = await Hash.of(fileStream)

    const path = `images/${cid}`
    const originalPath = await processAndStore(file, path, `original.${type}`)
    await processAndStore(file, path, `preview.${type}`, preview)
    onUploadImage(originalPath)
  }

  return <DragDrop onChange={onDrop} />
}
