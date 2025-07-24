<script
    setup
    lang="ts"
>

import {FilePdfRegular, ImageRegular, FileRegular, CloudDownloadAlt} from '@vicons/fa'

interface Props {
  files: File[]
  showPreview?: boolean
  showRemove?: boolean
  emptyMessage?: string,
  cols: number
}

const props = withDefaults(defineProps<Props>(), {
  showPreview: true,
  showRemove: false,
  emptyMessage: 'Документы не прикреплены',
  cols: 1
})

const emit = defineEmits<{
  remove: [index: number]
}>()

const showModal = ref(false)
const currentFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const previewType = ref<'image' | 'pdf' | 'unsupported'>('unsupported')

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIconComponent = (file: File) => {
  if (file.type.startsWith('image/')) return ImageRegular
  if (file.type === 'application/pdf') return FilePdfRegular
  return FileRegular
}
const getFileIconColor = (file: File) => {
  if (file.type.startsWith('image/')) return '#22c55e' // green-500
  if (file.type === 'application/pdf') return '#ef4444' // red-500
  return '#6b7280' // gray-500
}

const canPreview = (file: File): boolean => {
  return file.type.startsWith('image/') || file.type === 'application/pdf'
}

const previewFile = (file: File) => {
  if (!canPreview(file)) {
    // Для неподдерживаемых файлов показываем информацию
    currentFile.value = file
    previewType.value = 'unsupported'
    showModal.value = true
    return
  }

  currentFile.value = file

  // Освобождаем предыдущий URL если есть
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }

  // Создаем новый URL для файла
  previewUrl.value = URL.createObjectURL(file)

  if (file.type.startsWith('image/')) {
    previewType.value = 'image'
  } else if (file.type === 'application/pdf') {
    previewType.value = 'pdf'
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  currentFile.value = null
}

const downloadFile = () => {
  if (currentFile.value) {
    const url = URL.createObjectURL(currentFile.value)
    const a = document.createElement('a')
    a.href = url
    a.download = currentFile.value.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

const removeFile = (index: number) => {
  emit('remove', index)
}

// Очистка URL при размонтировании компонента
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div>
    <div
        v-if="files.length > 0"
        :class="{'grid-cols-1': cols === 1, 'grid-cols-2': cols === 2, 'grid-cols-3': cols === 3, 'grid-cols-4': cols === 4, 'grid-cols-5': cols === 5, 'grid-cols-6': cols === 6}"
        class="space-y-2 grid gap-2"
    >
      <div
          v-for="(file, index) in files"
          :key="index"
          class="p-3 bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all"
          @click="previewFile(file)"
      >
        <div class="flex items-center">
          <component class="w-5 h-5" :is="getFileIconComponent(file)" :style="{color: getFileIconColor(file), fontSize: '.25rem', marginRight: '0.75rem'}" />
          <div>
            <div class="text-sm font-medium text-gray-900">{{ file.name }}</div>
            <div class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <n-button
              v-if="showRemove"
              size="small"
              text
              severity="danger"
              @click.stop="removeFile(index)"
              class="hover:bg-red-100"
          >
            <template #icon>
              <svg class="w-5 h-5" width="1em" height="1em" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" fill="#ef4444"/></svg>
            </template>
          </n-button>
        </div>
      </div>
    </div>
    <div
        v-else
        class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg"
    >
      <FileRegular class="w-5 h-5" style="color: #9ca3af; font-size: 2rem; margin-bottom: 0.5rem;" />
      <p class="text-sm">{{ emptyMessage }}</p>
    </div>

    <!-- Модальное окно предпросмотра -->
    <n-modal
        v-model:show="showModal"
        :modal="true"
        :closable="true"
        :draggable="false"
        class="file-preview-modal"
        :style="{ width: '90vw', maxWidth: '1200px' }"
        @hide="closeModal"
    >
      <template #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center">
            <component class="w-5 h-5" :is="getFileIconComponent(currentFile)" :style="{color: getFileIconColor(currentFile), fontSize: '1.25rem', marginRight: '0.5rem'}" v-if="currentFile" />
            <FileRegular class="w-5 h-5" v-else style="color: #6b7280; font-size: 1.25rem; margin-right: 0.5rem;" />
            <span class="font-medium">{{ currentFile?.name }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <n-button
                size="small"
                text
                @click="downloadFile"
                v-tooltip="'Скачать файл'"
            >
              <template #icon>
                <CloudDownloadAlt class="w-5 h-5" />
              </template>
            </n-button>
          </div>
        </div>
      </template>
      <n-card :title="currentFile?.name">
        <div class="file-preview-content">
          <!-- Предпросмотр изображений -->
          <div
              v-if="previewType === 'image'"
              class="text-center"
          >
            <img
                :src="previewUrl"
                :alt="currentFile?.name"
                class="max-w-full max-h-[70vh] object-contain mx-auto rounded shadow-sm"
            />
          </div>

          <!-- Предпросмотр PDF -->
          <div
              v-else-if="previewType === 'pdf'"
              class="w-full"
          >
            <iframe
                :src="previewUrl"
                class="w-full h-[70vh] border rounded"
                frameborder="0"
            />
          </div>

          <!-- Неподдерживаемые файлы -->
          <div
              v-else
              class="text-center py-8"
          >
            <FileRegular class="w-5 h-5" style="color: #9ca3af; font-size: 3.5rem; margin-bottom: 1rem;" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Предпросмотр недоступен</h3>
            <p class="text-gray-600 mb-4">
              Файл типа "{{ currentFile?.type || 'неизвестный' }}" не поддерживает предпросмотр
            </p>
            <div class="space-y-2 text-sm text-gray-500">
              <div><strong>Размер:</strong> {{ currentFile ? formatFileSize(currentFile.size) : '' }}</div>
              <div><strong>Тип:</strong> {{ currentFile?.type || 'неизвестный' }}</div>
            </div>
            <n-button
                label="Скачать файл"
                class="mt-4"
                @click="downloadFile"
            >
              <template #icon>
                <CloudDownloadAlt class="w-5 h-5" />
              </template>
            </n-button>
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>
:deep(.file-preview-modal .p-dialog-content) {
  padding: 0;
}

:deep(.file-preview-modal .p-dialog-header) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.file-preview-content {
  padding: 1rem;
  min-height: 200px;
}
</style>