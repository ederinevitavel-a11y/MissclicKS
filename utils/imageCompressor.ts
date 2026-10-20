/**
 * Client-side image compression utility.
 * Compresses and resizes high-resolution screenshots before uploading to Supabase Storage,
 * ensuring uploads are fast, bandwidth is saved, and the 1 GB free quota lasts virtually forever.
 */
export const compressImage = async (
  file: File, 
  maxWidth = 1600, 
  maxHeight = 1600, 
  quality = 0.8
): Promise<File> => {
  // Only attempt to compress standard image files
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // If already under 200 KB, no need to compress further
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            // Return compressed if smaller, else keep original
            resolve(compressedFile.size < file.size ? compressedFile : file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
