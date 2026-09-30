<template>
  <img
    class="ae-file-icon"
    :src="iconSrc"
    :alt="altText"
    width="40"
    height="52"
  >
</template>

<script>
  import { computed } from 'vue';

  const ICON_BASE = '/static/action_education_portal/file-icons';

  /** Extension → SVG filename (without .svg). */
  const EXT_ICON = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    odt: 'odt',
    rtf: 'doc',
    txt: 'txt',
    epub: 'blank',
    xls: 'xls',
    xlsx: 'xlsx',
    ods: 'ods',
    csv: 'csv',
    ppt: 'ppt',
    pptx: 'pptx',
    odp: 'ppt',
    mp4: 'mp4',
    webm: 'mp4',
    ogv: 'mp4',
    mov: 'mp4',
    mkv: 'mp4',
    mp3: 'mp3',
    ogg: 'mp3',
    oga: 'mp3',
    wav: 'mp3',
    m4a: 'mp3',
    flac: 'mp3',
    jpg: 'jpg',
    jpeg: 'jpg',
    png: 'png',
    gif: 'png',
    webp: 'png',
    svg: 'png',
    zip: 'zip',
    rar: 'zip',
    '7z': 'zip',
  };

  const KIND_ICON = {
    document: 'pdf',
    spreadsheet: 'xlsx',
    presentation: 'pptx',
    video: 'mp4',
    audio: 'mp3',
    image: 'png',
    archive: 'zip',
    other: 'blank',
  };

  export default {
    name: 'AeFileTypeBadge',
    props: {
      filename: {
        type: String,
        default: '',
      },
      kind: {
        type: String,
        default: '',
      },
    },
    setup(props) {
      const ext = computed(() => {
        const name = props.filename || '';
        const parts = name.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
      });

      const iconName = computed(() => {
        if (EXT_ICON[ext.value]) {
          return EXT_ICON[ext.value];
        }
        return KIND_ICON[props.kind] || 'blank';
      });

      const iconSrc = computed(() => `${ICON_BASE}/${iconName.value}.svg`);

      const altText = computed(() => {
        const e = (ext.value || iconName.value || 'file').toUpperCase();
        return e;
      });

      return {
        iconSrc,
        altText,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ae-file-icon {
    display: block;
    flex-shrink: 0;
    width: 40px;
    height: 52px;
    object-fit: contain;
  }
</style>
