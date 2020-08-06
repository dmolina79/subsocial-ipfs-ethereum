import React, { useState } from 'react'
import { Button, Upload, message } from 'antd'
import { useOrbitDbContext } from '../orbitdb'
import { importDataFromJson } from './filler'
import { useRouter } from 'next/router'
import { UploadOutlined } from '@ant-design/icons';
import { parseJsonFromFile } from './utils'
import { Loading } from '../utils'

export const FillerInput = () => {
  const { orbitdb } = useOrbitDbContext()
  const [ submitting, setSubmitting ] = useState(false)
  const router = useRouter()

  const onChange = async (file: File | Blob) => {
    try {
      setSubmitting(true)
      const data = await parseJsonFromFile(file)
      await importDataFromJson(orbitdb, data)
      setSubmitting(false)
      router.push('/myspaces', '/myspaces')
    } catch (err) {
      console.error('Failed filled: ', err)
      setSubmitting(false)
    }

  }

  return <>
    {submitting && <Loading label='Importing data...'></Loading>}
    <Upload
      name='file'
      accept='application/json'
      onChange={(info) => {
        const { status } = info.file;
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
          onChange && info.file.originFileObj && onChange(info.file.originFileObj)
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      }
    }
    >
      <Button>
        <UploadOutlined /> Import
      </Button>
    </Upload>
  </>
}