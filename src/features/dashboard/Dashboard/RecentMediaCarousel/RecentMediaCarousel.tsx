"use client"

import { ActionIcon, Box } from "@mantine/core"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useEffect, useRef, useState } from "react"
import { MediaPage } from "../MediaPage"

export function RecentMediaCarousel({
  items,
  mediaIds,
  onOpenMedia,
}: {
  items: string[]
  mediaIds?: readonly string[]
  onOpenMedia?: (id: string) => void
}) {
  const [page, setPage] = useState(0)
  const [fromPage, setFromPage] = useState<number | null>(null)
  const [direction, setDirection] = useState<"previous" | "next">("next")
  const [sliding, setSliding] = useState(false)
  const [pageSize, setPageSize] = useState(8)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.ceil(items.length / pageSize)
  const itemsFor = (targetPage: number) =>
    items.slice(targetPage * pageSize, targetPage * pageSize + pageSize)
  const hasPrevious = page > 0
  const hasNext = page < pageCount - 1

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updatePageSize = (width: number) => {
      const gap = 8
      const targetThumbnailWidth = 132
      const nextPageSize = Math.max(
        2,
        Math.min(8, Math.floor((width + gap) / (targetThumbnailWidth + gap))),
      )
      setPageSize((current) => {
        if (current === nextPageSize) return current
        setPage(0)
        setFromPage(null)
        setSliding(false)
        return nextPageSize
      })
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updatePageSize(entry.contentRect.width)
    })
    observer.observe(element)
    updatePageSize(element.getBoundingClientRect().width)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!sliding) return
    const timer = window.setTimeout(() => {
      setSliding(false)
      setFromPage(null)
    }, 260)
    return () => window.clearTimeout(timer)
  }, [sliding])

  const moveTo = (targetPage: number, nextDirection: "previous" | "next") => {
    if (sliding || targetPage === page) return
    setFromPage(page)
    setDirection(nextDirection)
    setPage(targetPage)
    requestAnimationFrame(() => requestAnimationFrame(() => setSliding(true)))
  }

  const oldPage = fromPage ?? page

  return (
    <Box ref={containerRef} pos="relative" style={{ overflow: "hidden" }}>
      <style>{`
        .dashboard-carousel-track {
          display: flex;
          width: 200%;
          will-change: transform;
        }
        .dashboard-carousel-track.next { transform: translateX(0); }
        .dashboard-carousel-track.next.sliding { transform: translateX(-50%); }
        .dashboard-carousel-track.previous { transform: translateX(-50%); }
        .dashboard-carousel-track.previous.sliding { transform: translateX(0); }
        .dashboard-carousel-track.sliding { transition: transform 260ms ease; }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-carousel-track.sliding { transition: none; }
        }
      `}</style>

      {fromPage === null ? (
        <MediaPage
          items={itemsFor(page)}
          page={page}
          pageSize={pageSize}
          mediaIds={mediaIds}
          onOpenMedia={onOpenMedia}
        />
      ) : (
        <Box
          className={`dashboard-carousel-track ${direction} ${sliding ? "sliding" : ""}`}
        >
          {direction === "next" ? (
            <>
              <MediaPage
                items={itemsFor(oldPage)}
                page={oldPage}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
            </>
          ) : (
            <>
              <MediaPage
                items={itemsFor(page)}
                page={page}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
              <MediaPage
                items={itemsFor(oldPage)}
                page={oldPage}
                pageSize={pageSize}
                mediaIds={mediaIds}
                onOpenMedia={onOpenMedia}
              />
            </>
          )}
        </Box>
      )}

      {hasPrevious && (
        <Box
          aria-hidden="true"
          pos="absolute"
          top={0}
          bottom={0}
          left={0}
          w={72}
          style={{
            pointerEvents: "none",
            zIndex: 1,
            background:
              "linear-gradient(90deg, var(--mantine-color-body), transparent)",
          }}
        />
      )}
      {hasNext && (
        <Box
          aria-hidden="true"
          pos="absolute"
          top={0}
          bottom={0}
          right={0}
          w={72}
          style={{
            pointerEvents: "none",
            zIndex: 1,
            background:
              "linear-gradient(270deg, var(--mantine-color-body), transparent)",
          }}
        />
      )}
      {hasPrevious && (
        <ActionIcon
          aria-label="前のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          disabled={sliding}
          onClick={() => moveTo(page - 1, "previous")}
          style={{
            position: "absolute",
            left: "var(--mantine-spacing-sm)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconChevronLeft size={22} />
        </ActionIcon>
      )}
      {hasNext && (
        <ActionIcon
          aria-label="次のMediaへ"
          variant="filled"
          color="dark"
          radius="xl"
          size="lg"
          disabled={sliding}
          onClick={() => moveTo(page + 1, "next")}
          style={{
            position: "absolute",
            right: "var(--mantine-spacing-sm)",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
          }}
        >
          <IconChevronRight size={22} />
        </ActionIcon>
      )}
    </Box>
  )
}

