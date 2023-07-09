---
title: vue-md
---

  # Button

  
  > The only true button.
  
  
  
  
  
  
  

  
## Props

  | Prop name     | Description | Type      | Values      | Default     |
  | ------------- | ----------- | --------- | ----------- | ----------- |
  | color | The color for the button. | string | - | '#333' |
| size | The size of the button | string | `small`, `normal`, `large` | 'normal' |
| onClick | Gets called when the user clicks on the button<br/>`@ignore` true | func | - | event =&gt; {<br/>  console.log('You have clicked me!', event.target);<br/>} |

  
  
  
  
## Slots

  | Name          | Description  | Bindings |
  | ------------- | ------------ | -------- |
  | default | Content of button |  |

  
  ---
Use vue live right here too

````markdown
```jsx live
<Button>I’m transparent!</Button>
```
````

```jsx live
<Button>I’m transparent!</Button>
```

To render an example as highlighted source code remove the live modifier

```html
<Button>I’m transparent!</Button>
```

  
  