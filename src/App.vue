<template>
  <MainLayout>
    <router-view />
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layout/MainLayout.vue';
</script>

<style scoped lang="scss">
.welcome-container {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 40px;

  .welcome-card {
    background: rgba(255, 255, 255, 0.4);
    border: none;
    border-radius: 16px;
    
    .dark & {
      background: rgba(40, 40, 40, 0.4);
    }
    
    h2 {
      margin: 0;
      background: linear-gradient(135deg, var(--el-color-primary), #a2c2e8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .welcome-content {
    text-align: center;
    padding: 20px 0;
    
    p {
      color: var(--el-text-color-regular);
      font-size: 16px;
      margin-bottom: 32px;
    }

    .quick-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }

  .stats-grid {
    margin-top: 40px;
    background: rgba(255, 255, 255, 0.3);
    padding: 32px;
    border-radius: 16px;
    
    .dark & {
      background: rgba(30, 30, 30, 0.3);
    }
  }
}
</style>
