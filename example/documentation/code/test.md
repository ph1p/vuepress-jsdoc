---
title: test
---
# grid
This is an example of creating a reusable grid component and using it with external data.

::: tip Tags
**version**: 1.0.5<br />**author**: [Rafael](https://github.com/rafaesc92)<br />**since**: Version 1.0.1<br />
:::

## Table of contents
[[toc]]

## Props

### msg (`string|number`)
::: tip Tags
**version**: 1.0.5<br />**since**: Version 1.0.1<br />**see**: See [Wikipedia](https://en.wikipedia.org/wiki/Web_colors#HTML_color_names) for a list of color names<br />**link**: See [Wikipedia](https://en.wikipedia.org/wiki/Web_colors#HTML_color_names) for a list of color names<br />
:::


|type|default|description|
|:-|:-|:-|:-|
|`string|number`|text|object/array defaults should be returned from a factory function|
### myF (`func`)


|type|default|description|
|:-|:-|:-|:-|
|`func`|(param, param2) => {}|Function|
### v-model (`string`)
::: tip Tags
**model**: true<br />
:::


|type|default|description|
|:-|:-|:-|:-|
|`string`|-|Model example|
### data (`array`)
::: tip Tags
**version**: 1.0.5<br />
:::


|type|default|description|
|:-|:-|:-|:-|
|`array`|-|describe data|
### columns (`array`)


|type|default|description|
|:-|:-|:-|:-|
|`array`|-|get columns list|
### filterKey (`string`)
::: tip Tags
**ignore**: true<br />
:::


|type|default|description|
|:-|:-|:-|:-|
|`string`|'example'|filter key|


## Methods

### sortBy (key: `string`) -> `string`
 Sets the order

::: tip Tags
**access**: public<br />**version**: 1.0.5<br />**since**: Version 1.0.1<br />**param**: Key to order<br />**returns**: Test<br />
:::

#### Params
| name | type | description
|:-|:-|:-|
|key|`string`|Key to order

#### returns (string)
 Test
## Slots

### header
Use this slot header
### footer
Use this slot footer


## Events

### success (object | string)

Success event.
#### Properties
| name | type | description
|:-|:-|:-|
|example|`object`|the demo example
|exampleStr|`string`|the demo example
|exampleNum|`number`|the demo example

