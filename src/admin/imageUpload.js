const MAX_EDGE = 1100;

// Turns a picked image file into a reasonably small data URL (stored in the
// browser with the rest of the site content — no upload server involved).
export function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('فقط فایل تصویری مجاز است.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل ممکن نشد.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('تصویر قابل خواندن نیست.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
