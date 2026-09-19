export async function fileToPhoto(file: File): Promise<{ previewUrl: string; photoBase64: string }> {
  try {
    return await compressWithBitmap(file);
  } catch {
    const previewUrl = await readAsDataUrl(file);
    return { previewUrl, photoBase64: previewUrl.split(",")[1] ?? "" };
  }
}

async function compressWithBitmap(file: File): Promise<{ previewUrl: string; photoBase64: string }> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 900;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not process that photo. Try another one.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
  bitmap.close();
  return { previewUrl: dataUrl, photoBase64: dataUrl.split(",")[1] ?? "" };
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read that photo. Try another one."));
    reader.readAsDataURL(file);
  });
}
