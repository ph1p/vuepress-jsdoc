<template>
  <div class="navigation"></div>
</template>

<script>
export default {
  data() {
    return {
      num: 100
    };
  },
  computed: {
    testComputed() {
      return this.num * 5;
    }
  },
  methods: {
    /**
     * @param {number} num -
     */
    getNumber(num) {
      return num;
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped></style>
