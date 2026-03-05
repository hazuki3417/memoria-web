const download = (args: { url: string, fileName: string }) => {
  const { url, fileName } = args
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const action = {
  download,
}
