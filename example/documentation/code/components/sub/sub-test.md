
# grid

This is an example of creating a reusable grid component and using it with external data.

> This component is globally registered by Vue

**Since**: Version 1.0.1

**Version**: 1.0.5

**Authors**:
- [Rafael](https://github.com/rafaesc92)

## Props

| Prop name | Description | Type | Values | Default | Origin |
| - | - | - | - | - | - |
| msg | object/array defaults should be returned from a factory function<br/>`@link` See [Wikipedia](https://en.wikipedia.org/wiki/Web_colors#HTML_color_names) for a list of color names | `string \| number` | | text | |
| myF | Function | `function` | | (param, param2) => {} | |
| v-model | Model example<br/>`@model` | `string` | | | |
| data | describe data | `array` | | | |
| columns | get columns list | `array` | | | |
| filterKey | filter key | `string` | | 'example' | |

## Methods

### sortBy(key) ⇒ `string`
Sets the order

**Returns**: `string` - Test

**Since**: Version 1.0.1

**Version**: 1.0.5

**Params**:


| Param | Type | Description |
| --- | --- | --- |
| key | `string` | Key to order |

## Events

| Event name | Properties | Description |
| - | - | - |
| success | **example** `object` - the demo example<br/>**exampleStr** `string` - the demo example<br/>**exampleNum** `number` - the demo example | Success event. |

## Slots

| Name | Description | Bindings |
| - | - | - |
| header | Use this slot header | |
| footer | Use this slot footer | |

