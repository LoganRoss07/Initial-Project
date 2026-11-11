export function resizeImageToDataUrl(file, size = 200) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }

    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const side = Math.min(image.width, image.height)
      const sourceX = (image.width - side) / 2
      const sourceY = (image.height - side) / 2

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas.getContext('2d').drawImage(image, sourceX, sourceY, side, side, 0, 0, size, size)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That image could not be read. Try a different photo.'))
    }

    image.src = url
  })
}