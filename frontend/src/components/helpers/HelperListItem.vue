<script setup lang="ts">
import { Profile } from '@/models'
import { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  member: {
    type: Object as PropType<Profile>,
    required: true,
  },
})
</script>

<template>
  <v-list-item :to="{ name: 'helpers-id', params: { id: member.id } }">
    <template #prepend>
      <Avatar :profile="member" :height="48" :width="48" class="mr-5"></Avatar>
    </template>

    <v-list-item-title>{{ member.firstName }} {{ member.lastName }}</v-list-item-title>

    <v-list-item-subtitle class="pt-2">
      <v-chip v-if="member.isEmailPending && member.isPhonePending" class="text-warning">
        <v-icon class="mr-1" left color="warning">mdi-alert</v-icon>
        {{ $t('Pending Invite') }}
      </v-chip>

      <div v-else>
        <div v-if="member.relationshipAttributes">
          <v-row no-gutters>
            <v-chip
              v-if="
                !member.roles.includes('CLIENT') &&
                (!member.relationshipAttributes?.responseTypes ||
                  member.relationshipAttributes.responseTypes?.length === 0)
              "
              class="text-warning"
            >
              <v-icon class="mr-1" left color="warning">mdi-alert</v-icon>
              <span color="warning">{{ $t('Pending service requests') }}</span>
            </v-chip>

            <div v-else>
              <template v-for="requestType in member.relationshipAttributes.responseTypes" :key="requestType">
                <v-chip class="mr-2">
                  <i-mdi-car-back v-if="requestType == 'TRANSPORTATION'" class="mr-1" />
                  <i-mdi-food v-if="requestType == 'MEAL'" class="mr-1" />
                  <i-mdi-human-male-child v-if="requestType == 'CHILD_CARE'" class="mr-1" />
                  {{ $t(requestType) }}
                </v-chip>
              </template>

              <v-chip v-if="member.relationshipAttributes?.familyMemberType" class="ml-2">
                <i-mdi-human-male-child />
                {{ t(member.relationshipAttributes?.familyMemberType) }}
              </v-chip>
            </div>
          </v-row>
        </div>
      </div>
    </v-list-item-subtitle>

    <template #append>
      <v-btn class="chevron-right-padding" color="grey" variant="text" size="large">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </template>

    <v-divider />
  </v-list-item>
</template>
