const MAX_BYTES = 6 * 1024 * 1024;
const SIZE = 320;
const ALLOWED = /^image\/(png|jpe?g|webp)$/i;

/**
 * Turns a picked file into a square, compressed data URL that is small enough
 * to live in the account store (localStorage).
 */
export function readAvatarFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('تصویری انتخاب نشده است.'));
      return;
    }
    if (!ALLOWED.test(file.type)) {
      reject(new Error('فقط تصویر JPG، PNG یا WebP می‌تواند استفاده شود.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error('حجم تصویر باید کمتر از ۶ مگابایت باشد.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خواندن فایل ممکن نشد؛ دوباره تلاش کنید.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('این فایل به‌عنوان تصویر باز نشد.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(SIZE / image.width, SIZE / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(image, (SIZE - width) / 2, (SIZE - height) / 2, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
