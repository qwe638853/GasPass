<template>
  <router-view />
</template>

<script setup>
// No additional setup needed
</script>

<style>

/* Global loading animation */
.loading-spinner {
  @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin;
}

/* Enhanced scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gradient-to-b from-amber-400 to-orange-500 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply from-amber-500 to-orange-600;
}

/* Smooth focus styles */
*:focus {
  @apply outline-none ring-2 ring-amber-400/50 ring-offset-2;
}

/* Enhanced selection */
::selection {
  @apply bg-amber-200 text-amber-900;
}
</style>