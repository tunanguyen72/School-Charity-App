// Nén & thu nhỏ ảnh ở client trước khi gửi -> data URL JPEG gọn nhẹ (~vài chục KB)
export function compressImage(file: File, maxDim = 900, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không đọc được ảnh'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Ảnh không hợp lệ'))
      img.onload = () => {
        let { width, height } = img
        if (width >= height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Không xử lý được ảnh'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
