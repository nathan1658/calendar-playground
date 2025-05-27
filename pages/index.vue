<template>
  <VContainer>
    <ClientOnly><LanguageSelectBox /></ClientOnly>
    <BaseCard>{{ $t("helloWorld") }}</BaseCard>
    <ul>
      <li
        v-for="todo in todos"
        :key="todo.id"
      >
        <span>{{ todo.text }}</span>
      </li>
    </ul>
  </VContainer>
</template>

<script setup>
import { useCollection } from "vuefire";
import { collection, getFirestore } from "firebase/firestore";
const db = getFirestore();
const todos = useCollection(collection(db, "todos"));
</script>

<style scoped></style>
