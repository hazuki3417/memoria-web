import React, { CSSProperties, useMemo } from "react"

export interface LinkifyTextProps {
  text: string
  target?: React.HTMLAttributeAnchorTarget
  style?: CSSProperties
}

const FULL_SPACE_CHARS = "\\u3000"
const HALF_SPACE_CHARS = "\\u0020"
const LINE_BREAK_CHARS = "\\u000A"
const URL_PROTOCOL = "https?:\\/\\/"
const URL_BODY = `[^${FULL_SPACE_CHARS}${HALF_SPACE_CHARS}${LINE_BREAK_CHARS}]+`
const LINK_REGEX = new RegExp(`(${URL_PROTOCOL}${URL_BODY})`, "g")

export const LinkifyText = (props: LinkifyTextProps) => {
  const { text, target, style } = props

  const elements = useMemo(() => {
    const result: React.ReactNode[] = []
    let lastIndex = 0

    for (const match of text.matchAll(LINK_REGEX)) {
      if (match.index === undefined) continue
      const matchText = match[0]
      const start = match.index
      const end = start + matchText.length

      // 通常のテキストを push
      if (lastIndex < start) {
        result.push(text.slice(lastIndex, start))
      }

      // URL をリンク化して push
      result.push(
        <a
          key={start}
          href={matchText}
          target={target}
          style={style}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {matchText}
        </a>,
      )

      lastIndex = end
    }

    // 残りのテキスト
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex))
    }

    return result
  }, [text, target, style])

  return <>{elements}</>
}
