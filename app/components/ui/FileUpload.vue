<script
    setup
    lang="ts"
>

interface Props {
  accept?: string
  maxSize?: number // в MB
  multiple?: boolean
  placeholder?: string
  showPreview?: boolean
  compact?: boolean,
  cols?: number
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*,.pdf',
  maxSize: 10,
  multiple: true,
  placeholder: 'Перетащите файлы или нажмите для выбора',
  showPreview: true,
  compact: false,
  cols: 3
})

const files = defineModel<File[]>({default: () => []})

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
    target.value = '' // Сбрасываем input
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const addFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter(file => {
    // Проверка типа файла
    const acceptedTypes = props.accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', '/'))
      }
      return file.type === type
    })

    if (!isValidType) {
      alert(`Файл "${file.name}" имеет неподдерживаемый формат.`)
      return false
    }

    // Проверка размера
    if (file.size > props.maxSize * 1024 * 1024) {
      alert(`Файл "${file.name}" слишком большой. Максимальный размер: ${props.maxSize}MB.`)
      return false
    }

    return true
  })

  if (props.multiple) {
    files.value = [...files.value, ...validFiles]
  } else {
    files.value = validFiles.slice(0, 1)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Dropzone -->
    <div
        :class="[
        'border border-dashed rounded text-center transition-colors cursor-pointer',
        props.compact ? 'p-4' : 'p-6',
        isDragging 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400'
      ]"
        @drop="handleFileDrop"
        @dragover="handleDragOver"
        @dragenter.prevent
        @dragleave="handleDragLeave"
        @click="openFileDialog"
    >
      <i class="pi pi-cloud-upload text-gray-400 text-2xl mb-2"></i>
      <p class="text-sm text-gray-600 mb-1">{{ props.placeholder }}</p>
      <p class="text-xs text-gray-500">
        Поддерживаются {{ props.accept.includes('image') ? 'изображения' : '' }}
        {{ props.accept.includes('image') && props.accept.includes('pdf') ? ' и ' : '' }}
        {{ props.accept.includes('pdf') ? 'PDF' : '' }} до {{ props.maxSize }}MB
      </p>

      <input
          ref="fileInput"
          type="file"
          :multiple="props.multiple"
          :accept="props.accept"
          @change="handleFileUpload"
          class="hidden"
      />
    </div>

    <!-- File List -->
    <div
        v-if="files.length > 0 && props.showPreview"
        class="space-y-2"
    >
      <h4 class="font-medium text-gray-900">
        Загруженные файлы ({{ files.length }})
      </h4>
      <UiFileView
          :files="files"
          show-remove
          @remove="removeFile"
          :cols="cols"
      />
    </div>
  </div>
</template>

<style scoped>

</style>