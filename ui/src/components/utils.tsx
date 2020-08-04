import { NextPageContext } from 'next'
import { CSSProperties } from 'react';
import truncate from 'lodash.truncate'
import { LoadingOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import React from 'react';

export const TITLE_MIN_LEN = 3
export const TITLE_MAX_LEN = 100

export const DESC_MAX_LEN = 20_000

export function minLenError (fieldName: string, minLen: number): string {
  return `${fieldName} is too short. Minimum length is ${minLen} chars.`
}

export function maxLenError (fieldName: string, maxLen: number): string {
  return `${fieldName} is too long. Maximum length is ${maxLen} chars..`
}

export const return404 = ({ res }: NextPageContext) => {
  if (res) {
    res.statusCode = 404
  }
  return { statusCode: 404 }
}

export function pluralize (
  count: number | string,
  singularText: string,
  pluralText?: string
) {
  if (!count) {
    count = 0;
  } else if (typeof count === 'string') {
    count = parseInt(count)
  }

  const plural = () => !pluralText
    ? singularText + 's'
    : pluralText;

  const text = count === 1
    ? singularText
    : plural();

  return `${count} ${text}`;
}

export const toShortAddress = (_address: string) => {
  const address = (_address || '').toString();

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address;
}

type Props = {
  src: string,
  size?: number | string,
  height?: number | string,
  width?: number | string,
  rounded?: boolean,
  className?: string,
  style?: CSSProperties
};

export function DfBgImg (props: Props) {
  const { src, size, height = size, width = size, rounded = false, className = '', style } = props;

  const fullClass = 'DfBgImg ' + className;

  const fullStyle = Object.assign({
    backgroundImage: `url(${src})`,
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    borderRadius: rounded ? '50%' : '0',
    backgroundSize: 'cover'
  }, style);

  return <div className={fullClass} style={fullStyle} />;
}

const DEFAULT_SUMMARY_LENGTH = 300
const SEPARATOR = /[.,:;!?()[\]{}\s]+/

/** Shorten a plain text up to `limit` chars. Split by separators. */
export const summarize = (
  text?: string,
  limit: number = DEFAULT_SUMMARY_LENGTH
): string => {
  if (!text || text === '') return ''

  text = (text as string).trim()

  return text.length <= limit
    ? text
    : truncate(text, {
      length: limit,
      separator: SEPARATOR
    })
}

type LoadingProps = {
  label?: string,
  className?: string
}

export const Loading = ({ label, className }: LoadingProps) => <div className={`d-flex mt-3 justify-content-center ${className}`}>
  <LoadingOutlined className='mr-3' />
  {label}
</div>

type IconTextProps = {
  icon: React.FunctionComponent,
  text: React.ReactNode
}

export const IconText = ({ icon, text }: IconTextProps) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export const statusTag = (title: string, isReady: boolean) => isReady
  ? <Tag color="green">{`${title} Ready`}</Tag>
  : <Tag color="volcano">{`${title} Connecting...`}</Tag>

export const getIdFromFullPath = (path: string) => path.charAt(path.length-1)

export const getPathAndId = (fullPath: string) => {
  const length = fullPath.length
  const path = fullPath.substring(0, length-2)
  const id = getIdFromFullPath(fullPath)
  return {
    path,
    id
  }
}

export const DEFAULT_PATH = '/orbitdb/[hash]/spaces'

type CreateLink = {
  hash: string,
  spaceId: string
}

export const createSpaceLink = ({ hash }: CreateLink) => `/orbitdb/${hash}/spaces`

export const createPostLink = ({ hash, spaceId }: CreateLink) => `/orbitdb/${hash}/spaces/${spaceId}/posts`

export const pathToDbName = (path: string, id: string) => `${path.split('/').slice(3).join('/')}/${id}`