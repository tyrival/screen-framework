<template>
  <keep-alive>
    <router-view/>
  </keep-alive>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        router: true,
      };
    },
    computed: {
      getRouterPath () {
        return this.$route.path.replace('/', '')
      }
    }
  }
</script>
