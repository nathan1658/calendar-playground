<template>
  <div />
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo("/admin/calendars");
    },
  ],
});
</script>
