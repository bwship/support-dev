<template>
  <div class="profile-pic-container">
    <avatar :profile="props.profile" :width="140" :height="140"></avatar>

    <v-btn
      v-if="enableEdit"
      density="compact"
      icon="mdi-pencil"
      color="primary"
      class="edit-icon"
      @click="triggerFileInput"
    ></v-btn>
    <input ref="fileInput" type="file" accept="image/*" hidden @change="onFileChange" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { supabase } from '@/api/supabase'
import { useProfile } from '@/stores/profile'
import { Profile } from '@/models'
import useToasts from '@/composables/useToasts'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/auth/useAuth'
import { v4 as uuidv4 } from 'uuid'

const props = defineProps<{
  profile: Profile
  enableEdit: boolean
}>()

const { addToast } = useToasts()
const { t } = useI18n()
const profileStore = useProfile()
const auth = useAuth()
const enableEdit = ref(props.enableEdit)

const fileInput = ref<HTMLInputElement | null>(null)

const userId = computed(() => {
  return auth.user.id
})

// Method to handle file change
const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    if (e.target?.result !== undefined) {
      uploadImage(file)
    }
  }

  reader.readAsDataURL(file)
}

async function uploadImage(file: File) {
  try {
    const tempProfile = props.profile
    const bucketName = 'profile-images'

    let supabaseUrl = import.meta.env.VITE_SUPABASE_URL

    const path = `${userId.value}/${uuidv4()}-${tempProfile.id}-profile.jpg`

    let profileUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { cacheControl: '3600', contentType: 'image/jpg', upsert: true })

    if (error) {
      throw error
    } else {
      tempProfile.profileUrl = profileUrl

      await profileStore.upsert(tempProfile)
      addToast({ text: t('Profile image updated successfully'), variant: 'success' })
    }
  } catch (error: any) {
    addToast({ text: t('Error uploading profile image:' + error.message), variant: 'error' })
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<style scoped>
.profile-pic-container {
  position: relative;
  display: inline-block;
}

.edit-icon {
  position: absolute;
  bottom: 0px;
  right: 10px;
  min-width: 0px;
  min-height: 0px;
  cursor: pointer;
}
</style>
