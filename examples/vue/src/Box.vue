<template>
  <div v-bind:style="{backgroundColor: 'tomato', padding: '1em'}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'box'
}
</script>
