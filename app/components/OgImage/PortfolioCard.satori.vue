<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between p-20"
    :style="{ backgroundColor: '#0B0D10', color: '#E6E8EB', fontFamily: 'Geist', backgroundImage: 'linear-gradient(#1A1E24 1px, transparent 1px), linear-gradient(90deg, #1A1E24 1px, transparent 1px)', backgroundSize: '48px 48px' }"
  >
    <div class="flex items-center text-3xl" :style="{ fontFamily: 'Geist Mono', color: '#5EEAD4' }">
      <span>~/</span><span :style="{ color: '#E6E8EB', marginLeft: '2px' }">makuchpatryk</span>
    </div>
    <div class="flex flex-col">
      <div class="text-7xl font-semibold" :style="{ lineHeight: 1.05, letterSpacing: '-0.03em' }">{{ title }}</div>
      <div v-if="subtitle" class="mt-6 text-3xl" :style="{ color: '#8B93A1', lineHeight: 1.4, maxWidth: '900px' }">{{ subtitle }}</div>
    </div>
    <div class="flex text-2xl" :style="{ fontFamily: 'Geist Mono', color: '#5EEAD4' }">$ open to work</div>
  </div>
</template>
