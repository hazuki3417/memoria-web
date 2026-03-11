export type Limit = {
  upload: {
    file: {
      count: number
      size: number
      type: string[]
    }
    tag: {
      count: number
    }
  }
}
