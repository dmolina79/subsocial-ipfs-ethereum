import Dragger, { DraggerProps } from 'antd/lib/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useState } from 'react';

type DragDropProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (file: File | Blob) => void
}

export const DragDrop = ({ onChange, ...props}: DragDropProps) => {
  const [ uploaded, setUploaded ] = useState(false)
  const msg = uploaded ? 'You upload file yet' : 'Click or drag file to this area to upload';
  return <Dragger
    {...props}
    accept='video/*, image/*, audio/*'
    onChange={(info) => {
        const { status } = info.file;
        if (status !== 'uploading') {
          setUploaded(!!info.fileList.length)
        }
        if (status === 'done') {
          message.success(`${info.file.name} file uploaded successfully.`);
          onChange && info.file.originFileObj && onChange(info.file.originFileObj)
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      }
    }>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">{msg}</p>
  </Dragger>
}