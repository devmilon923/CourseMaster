export function isValidYouTubeUrl(url: string) {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)[\w-]{11}(\?.*)?$/;
  return regex.test(url);
}
