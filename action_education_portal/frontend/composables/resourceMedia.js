/**
 * How a course support is shown: player, image, PDF, YouTube video, web link or download.
 */

const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;

function parseUrl(url) {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
}

/** Video id of a YouTube address (watch, youtu.be, embed, shorts), or ''. */
export function youtubeId(url) {
  const parsed = parseUrl(url);
  if (!parsed || !YOUTUBE_HOSTS.includes(parsed.hostname)) {
    return '';
  }
  let id = '';
  if (parsed.hostname === 'youtu.be') {
    id = parsed.pathname.slice(1);
  } else if (parsed.pathname === '/watch') {
    id = parsed.searchParams.get('v') || '';
  } else {
    const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
    id = match ? match[2] : '';
  }
  return YOUTUBE_ID.test(id) ? id : '';
}

/** Privacy-friendly player address: no cookie until the learner presses play. */
export function youtubeEmbedUrl(url) {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : '';
}

const PDF_EXTENSIONS = ['pdf'];
const INLINE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const INLINE_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'mov'];
const INLINE_AUDIO_EXTENSIONS = ['mp3', 'ogg', 'oga', 'wav', 'm4a', 'flac'];

function extension(filename) {
  return String(filename || '')
    .split('.')
    .pop()
    .toLowerCase();
}

/**
 * "video" | "audio" | "image" | "pdf" | "youtube" | "link" | "download".
 * Only types browsers show safely inside the page are previewed; SVG, Office
 * files and archives are downloaded.
 */
export function previewKind(resource) {
  if (resource.kind === 'link' || resource.url) {
    return youtubeId(resource.url) ? 'youtube' : 'link';
  }
  const ext = extension(resource.original_filename);
  if (INLINE_VIDEO_EXTENSIONS.includes(ext)) {
    return 'video';
  }
  if (INLINE_AUDIO_EXTENSIONS.includes(ext)) {
    return 'audio';
  }
  if (INLINE_IMAGE_EXTENSIONS.includes(ext)) {
    return 'image';
  }
  if (PDF_EXTENSIONS.includes(ext)) {
    return 'pdf';
  }
  return 'download';
}

/** AeIcon name for a support in lists. */
export function previewIcon(kind) {
  return (
    {
      video: 'squarePlay',
      youtube: 'squarePlay',
      audio: 'headphones',
      image: 'image',
      pdf: 'fileText',
      link: 'globe',
    }[kind] || 'download'
  );
}
