<template>

  <div class="ae-drop">
    <div
      class="ae-drop-zone"
      :class="{ 'ae-drop-zone-over': dragOver }"
      @dragenter.prevent="dragOver = true"
      @dragover.prevent="dragOver = true"
      @dragleave.self="dragOver = false"
      @drop.prevent="onDrop"
    >
      <AeIcon
        name="folderPlus"
        class="ae-drop-icon"
        :size="44"
      />
      <p class="ae-drop-title">
        {{ dropFilesHere$() }}
      </p>
      <p class="ae-drop-or">
        {{ dropFilesOr$() }}
      </p>
      <label
        :for="inputId"
        class="ae-drop-browse"
      >{{ browseFilesAction$() }}</label>
      <input
        :id="inputId"
        class="ae-drop-input"
        type="file"
        multiple
        :accept="accept"
        :disabled="locked"
        @change="onPick"
      >
    </div>

    <p
      v-for="error in errors"
      :key="error"
      class="ae-drop-error"
      role="alert"
    >
      {{ error }}
    </p>

    <ul
      v-if="value.length"
      class="ae-drop-files"
    >
      <li
        v-for="item in value"
        :key="item.id"
        class="ae-drop-file"
      >
        <AeFileTypeBadge
          class="ae-drop-badge"
          :filename="item.file.name"
        />
        <span class="ae-drop-name">{{ item.file.name }}</span>
        <span
          class="ae-drop-status"
          :class="`ae-drop-status-${item.status}`"
        >
          {{ statusLabel(item.status) }}
        </span>
        <button
          v-if="!locked"
          type="button"
          class="ae-drop-remove"
          :aria-label="removeFileOf$({ name: item.file.name })"
          @click="remove(item)"
        >
          <AeIcon
            name="x"
            :size="20"
          />
        </button>
      </li>
    </ul>
  </div>

</template>


<script>

  import { ref } from 'vue';
  import { portalStrings } from '../strings';
  import { COURSE_FILE_ACCEPT, isAcceptedCourseFile } from '../composables/courseFiles';
  import AeFileTypeBadge from './AeFileTypeBadge';
  import AeIcon from './AeIcon';

  let instances = 0;

  /**
   * Course files to send: drop them or pick them. v-model holds
   * [{ id, file, status }] where status is ready, uploading, done or failed.
   */
  export default {
    name: 'AeFileDrop',
    components: { AeFileTypeBadge, AeIcon },
    setup(props, { emit }) {
      const {
        dropFilesHere$,
        dropFilesOr$,
        browseFilesAction$,
        fileReady$,
        fileUploading$,
        fileUploaded$,
        fileFailed$,
        removeFileOf$,
        fileTypeRejected$,
      } = portalStrings;

      instances += 1;
      const inputId = `ae-drop-input-${instances}`;
      const errors = ref([]);
      const dragOver = ref(false);
      let nextId = 0;

      const STATUS_LABELS = {
        ready: fileReady$,
        uploading: fileUploading$,
        done: fileUploaded$,
        failed: fileFailed$,
      };

      function statusLabel(status) {
        return STATUS_LABELS[status]();
      }

      function add(list) {
        errors.value = [];
        const added = [];
        Array.from(list || []).forEach(file => {
          if (!isAcceptedCourseFile(file.name)) {
            errors.value.push(fileTypeRejected$({ name: file.name }));
            return;
          }
          const known = [...props.value, ...added].some(
            item => item.file.name === file.name && item.file.size === file.size,
          );
          if (!known) {
            nextId += 1;
            added.push({ id: `${inputId}-${nextId}`, file, status: 'ready' });
          }
        });
        if (added.length) {
          emit('input', [...props.value, ...added]);
        }
      }

      function onPick(event) {
        add(event.target.files);
        // The same file can be picked again after a removal.
        event.target.value = '';
      }

      function onDrop(event) {
        dragOver.value = false;
        if (!props.locked) {
          add(event.dataTransfer && event.dataTransfer.files);
        }
      }

      function remove(item) {
        emit(
          'input',
          props.value.filter(other => other.id !== item.id),
        );
      }

      return {
        dropFilesHere$,
        dropFilesOr$,
        browseFilesAction$,
        removeFileOf$,
        accept: COURSE_FILE_ACCEPT,
        inputId,
        errors,
        dragOver,
        statusLabel,
        onPick,
        onDrop,
        remove,
      };
    },
    props: {
      value: {
        type: Array,
        required: true,
      },
      /** While files upload, the list cannot change. */
      locked: {
        type: Boolean,
        default: false,
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '../styles/tokens';
  @import '../styles/components';

  .ae-drop-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 16px 18px;
    text-align: center;
    background: #fffaf6;
    border: 2px dashed var(--ae-orange);
    border-radius: var(--ae-radius-md);
    transition: background-color 150ms ease;

    &:focus-within {
      box-shadow: var(--ae-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  // While a file is dragged, children must not steal the drag events.
  .ae-drop-zone-over {
    background: var(--ae-orange-wash);

    * {
      pointer-events: none;
    }
  }

  .ae-drop-icon {
    color: var(--ae-orange);
  }

  .ae-drop-title {
    margin: 8px 0 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--ae-navy);
  }

  .ae-drop-or {
    margin: 2px 0 10px;
    font-size: 14px;
    color: var(--ae-text-muted);
  }

  .ae-drop-browse {
    @include ae-button-outline;
  }

  .ae-drop-input {
    @include ae-visually-hidden;
  }

  .ae-drop-error {
    margin: 6px 0 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ae-danger);
  }

  .ae-drop-files {
    max-height: 176px;
    padding: 0;
    margin: 12px 0 0;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--ae-line);
    border-radius: var(--ae-radius-md);
  }

  .ae-drop-file {
    display: flex;
    gap: 14px;
    align-items: center;
    min-height: 44px;
    padding: 4px 12px;

    & + & {
      border-top: 1px solid var(--ae-line);
    }
  }

  .ae-drop-badge {
    flex-shrink: 0;
    width: 24px;
    height: 30px;
  }

  .ae-drop-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    color: var(--ae-navy);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ae-drop-status {
    display: inline-flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    font-size: 14px;

    &::before {
      width: 8px;
      height: 8px;
      content: '';
      background: currentColor;
      border-radius: 50%;
    }
  }

  .ae-drop-status-ready,
  .ae-drop-status-done {
    color: #1b7f45;
  }

  .ae-drop-status-uploading {
    color: var(--ae-orange-ink);
  }

  .ae-drop-status-failed {
    color: var(--ae-danger);
  }

  .ae-drop-remove {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--ae-navy);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ae-radius-sm);

    &:hover {
      background: var(--ae-surface-muted);
    }

    @include ae-focus-ring;
  }

  @media (max-height: 699px) {
    .ae-drop-zone {
      padding-block: 10px 12px;
    }

    .ae-drop-icon {
      width: 34px;
      height: 34px;
    }

    .ae-drop-files {
      max-height: 132px;
    }
  }

</style>
