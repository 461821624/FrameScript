<template>
  <div class="layout-wrapper">
    <TitleBar />
    <div class="layout-body">
      <Sidebar />
      <main class="content-area">
        <router-view v-if="route" />
        <slot v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import TitleBar from '@/components/TitleBar/index.vue';
import Sidebar from './Sidebar.vue';

const route = useRoute();
</script>

<style scoped lang="scss">
.layout-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  /* Use a very subtle gradient for the content area to add depth */
  background: linear-gradient(180deg, var(--bg-color) 0%, rgba(var(--primary-color), 0.02) 100%);
  position: relative;
  
  /* Scrollbar refinement */
  &::-webkit-scrollbar {
    width: 8px;
  }
}
</style>
