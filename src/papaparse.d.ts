declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[]
    errors: ParseError[]
    meta: {
      delimiter: string | null
      linebreak: string
      aborted: boolean
      truncated: boolean
      fields: string[] | undefined
    }
  }

  export interface ParseError {
    row: number
    code: string
    message: string
    type: string
  }

  export interface ParseOptions<T> {
    complete?: (results: ParseResult<T>) => void
    error?: (error: Error) => void
    header?: boolean
    dynamicTyping?: boolean
    skipEmptyLines?: boolean | 'greedy'
    // Thêm các tùy chọn khác nếu cần
  }

  export function parse<T>(input: string | File, options?: ParseOptions<T>): void
}
