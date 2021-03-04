<template>
  <RadioGroup :id="id" :value="value" :disabled="disabled" class="boolean-field u-12/12" @input="handleInput">
    <slot>
      <RadioButton :label="valueFalse" class="u-6/12">{{ $t('common.boolean.false') }}</RadioButton>
      <RadioButton :label="valueTrue" class="u-6/12">{{ $t('common.boolean.true') }}</RadioButton>
    </slot>
  </RadioGroup>
</template>

<script>
import VueTypes from 'vue-types'
import { RadioGroup, RadioButton } from 'element-ui'

export default {
  components: {
    RadioGroup,
    RadioButton
  },
  props: {
    id: VueTypes.string,
    value: VueTypes.any.isRequired,
    valueTrue: VueTypes.any.def(true),
    valueFalse: VueTypes.any.def(false),
    disabled: VueTypes.bool.def(false)
  },

  methods: {
    handleInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-radio-button__inner {
  width: 100% !important;
}
</style>
