# Xue.js
Exploring JS reactivity without libraries for fun.


```html
<div id="app">
  <h1>Mi nombre es {{ user.name }}</h1>
</div>
```

```js
const xm = new Xue({
  el: '#app',
  data: {
    user: {
      name: 'Eliseo'
    }
  }
})
```
