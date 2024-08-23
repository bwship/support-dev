<script setup lang="ts">
import { computed, PropType } from 'vue'
import { Profile } from '@/models'

const props = defineProps({
  profile: {
    type: Object as PropType<Profile>,
    default: null,
  },
  height: {
    type: Number,
    default: 100,
  },
  width: {
    type: Number,
    default: 100,
  },
  borderRadius: {
    type: String,
    default: '50%',
  },
})

const height = computed(() => {
  return props.height + 'px'
})

const profile = computed(() => {
  return props.profile
})
const width = computed(() => {
  return props.width + 'px'
})

const fontSize = computed(() => {
  return Math.floor((Math.min(props.width, props.height) * 40) / 100) + 'px'
})
const initials = computed(() => {
  if (props.profile) {
    return (
      (props.profile.firstName.length ? props.profile.firstName[0] : '') +
      (props.profile.lastName.length ? props.profile.lastName[0] : '')
    )
  }
  return ''
})
</script>

<template>
  <div class="container" :style="{ height, width, borderRadius: props.borderRadius }">
    <div v-if="profile">
      <img v-if="profile.profileUrl" :src="profile.profileUrl" class="image" />
      <div v-else class="initials" :style="{ height, width, fontSize }">{{ initials }}</div>
    </div>
    <div v-else>
      <div class="no-profile text-warning" :style="{ height, width, fontSize }">
        <i-mdi-warning />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  color: white;
  background-color: #2f2f2f;
  border: 4px solid #626262;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: sans-serif;
  overflow: hidden;
}
.image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center;
}
.initials {
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-profile {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
