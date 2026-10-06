export const recentMedia = [
  "/media-browser/h-01.png",
  "/media-browser/w-01.png",
  "/group-browser/group-media-01.jpg",
  "/group-browser/group-media-02.jpg",
  "/media-browser/h-02.png",
  "/group-browser/group-media-03.jpg",
  "/group-browser/group-media-04.jpg",
  "/media-browser/w-02.png",
  "/group-browser/group-media-05.jpg",
  "/group-browser/group-media-06.jpg",
  "/group-browser/group-media-07.jpg",
  "/group-browser/group-media-08.jpg",
].flatMap((src) => [src, src, src])

export const recentGroups = [
  { name: "旅行", media: ["/group-browser/group-media-01.jpg", "/group-browser/group-media-02.jpg", "/group-browser/group-media-03.jpg", "/group-browser/group-media-04.jpg"] },
  { name: "家族", media: ["/media-browser/h-01.png", "/media-browser/w-01.png", "/group-browser/group-media-05.jpg"] },
  { name: "風景", media: ["/media-browser/h-02.png", "/media-browser/w-02.png"] },
  { name: "お気に入り", media: ["/media-browser/w-01.png"] },
  { name: "イベント", media: ["/group-browser/group-media-06.jpg", "/group-browser/group-media-07.jpg"] },
  { name: "記録", media: [] },
]
