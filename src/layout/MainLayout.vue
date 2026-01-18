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
  padding: 24px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.2);
  
  .dark & {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
