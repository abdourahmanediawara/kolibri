/**
 * File types a trainer can add to a course (the server checks them again, with the size).
 */
export const COURSE_FILE_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'odt',
  'rtf',
  'txt',
  'epub',
  'xls',
  'xlsx',
  'ods',
  'csv',
  'ppt',
  'pptx',
  'odp',
  'mp4',
  'webm',
  'ogv',
  'mov',
  'mkv',
  'mp3',
  'ogg',
  'oga',
  'wav',
  'm4a',
  'flac',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'zip',
  '7z',
  'rar',
];

/** Value of the `accept` attribute of course file pickers. */
export const COURSE_FILE_ACCEPT = COURSE_FILE_EXTENSIONS.map(ext => `.${ext}`).join(',');

export function isAcceptedCourseFile(filename) {
  const ext = String(filename || '')
    .split('.')
    .pop()
    .toLowerCase();
  return COURSE_FILE_EXTENSIONS.includes(ext);
}
