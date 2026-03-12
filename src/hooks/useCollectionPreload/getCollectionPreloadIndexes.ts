export type GetCollectionPreloadIndexesArgs = {
  length: number
  index: number
  loop?: boolean
  distance?: number
}

export const getCollectionPreloadIndexes = ({
  length,
  index,
  loop = false,
  distance = 1,
}: GetCollectionPreloadIndexesArgs): number[] => {
  const indexes: number[] = []

  if (length === 0) {
    return indexes
  }

  for (let d = 1; d <= distance; d++) {
    let next = index + d
    let prev = index - d

    if (loop) {
      next = (next + length) % length
      prev = (prev + length) % length
    }

    if (next >= 0 && next < length) {
      indexes.push(next)
    }

    if (prev >= 0 && prev < length) {
      indexes.push(prev)
    }
  }

  return indexes
}
