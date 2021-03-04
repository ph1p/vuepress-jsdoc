---
title: BooleanField
---
# BooleanField

## Props

| Prop name  | Description | Type                     | Values | Default |
| ---------- | ----------- | ------------------------ | ------ | ------- |
| id         |             | VueTypes.string          | -      |         |
| value      |             | VueTypes.any.isRequired  | -      |         |
| valueTrue  |             | VueTypes.any.def(true)   | -      |         |
| valueFalse |             | VueTypes.any.def(false)  | -      |         |
| disabled   |             | VueTypes.bool.def(false) | -      |         |

## Events

| Event name | Properties | Description |
| ---------- | ---------- | ----------- |
| input      |            |

## Slots

| Name    | Description | Bindings |
| ------- | ----------- | -------- |
| default |             |          |

---

```vue live
<BooleanField>Default Example Usage</BooleanField>
```
