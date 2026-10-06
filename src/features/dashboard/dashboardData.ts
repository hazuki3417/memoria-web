export const recentMedia = [
  "/__dev-assets/media-browser/h-01.png",
  "/__dev-assets/media-browser/w-01.png",
  "/__dev-assets/group-browser/group-media-01.jpg",
  "/__dev-assets/group-browser/group-media-02.jpg",
  "/__dev-assets/media-browser/h-02.png",
  "/__dev-assets/group-browser/group-media-03.jpg",
  "/__dev-assets/group-browser/group-media-04.jpg",
  "/__dev-assets/media-browser/w-02.png",
  "/__dev-assets/group-browser/group-media-05.jpg",
  "/__dev-assets/group-browser/group-media-06.jpg",
  "/__dev-assets/group-browser/group-media-07.jpg",
  "/__dev-assets/group-browser/group-media-08.jpg",
].flatMap((src) => [src, src, src])

export const recentGroups = [
  { name: "旅行", media: ["/__dev-assets/group-browser/group-media-01.jpg", "/__dev-assets/group-browser/group-media-02.jpg", "/__dev-assets/group-browser/group-media-03.jpg", "/__dev-assets/group-browser/group-media-04.jpg"] },
  { name: "家族", media: ["/__dev-assets/media-browser/h-01.png", "/__dev-assets/media-browser/w-01.png", "/__dev-assets/group-browser/group-media-05.jpg"] },
  { name: "風景", media: ["/__dev-assets/media-browser/h-02.png", "/__dev-assets/media-browser/w-02.png"] },
  { name: "お気に入り", media: ["/__dev-assets/media-browser/w-01.png"] },
  { name: "イベント", media: ["/__dev-assets/group-browser/group-media-06.jpg", "/__dev-assets/group-browser/group-media-07.jpg"] },
  { name: "記録", media: [] },
]
