import { NextApiRequest, NextApiResponse } from 'next'

export type ApiResult<R> = {
  result?: R,
  error?: string
}

const ok = <R>(result: R) => ({ result })

const error = (error: string) => ({ error })

export const returnOk = <R>(res: NextApiResponse, result: R) => {
  return res.status(200).json(ok(result))
}

export const returnClientError = <R>(res: NextApiResponse, err: string | Error) => {
  return res.status(400).json(error((err || 'Bad Request').toString()))
}

export const returnServerError = <R>(res: NextApiResponse, err: string | Error) => {
  return res.status(500).json(error((err || 'Internal Server Error').toString()))
}

export const newRequireParam = <Params>(req: NextApiRequest, res: NextApiResponse) => {
  return (paramName: keyof Params): string => {
    const param = req.query[paramName as string] as string
    if (!param || typeof param !== 'string' || param.trim().length === 0) {
      returnClientError(res, `${paramName} param is missing or empty`)
      return '...ignore...'
    } else {
      return param
    }
  }
}