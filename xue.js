
; (function (root, factory) {
  root.Xue = factory()
})(this /* window */, function () {

  window.fakeVirtualDOM = {}

  const isText = node => (
    node.nodeName === '#text' &&
    !!node.textContent.trim()
  )

  const isObject = node => (
    typeof node === 'object' &&
    node !== null
  )

  function Xue(conf) {
    this.$el = document.querySelector(conf.el)

    for (const key in conf.data)
      this[key] = conf.data[key]

    this.walkInDom(this.$el)

    for (const key in conf.data)
      this.reactiveBinder(this, key)
  }

  Xue.prototype.dispatchReactiveChange = function (key) {
    const { node, text } = fakeVirtualDOM[key]
    node.textContent = this.getFinalText(text)
  }

  Xue.prototype.reactiveBinder = function (parent, child) {
    let nodeValue = parent[child]

    if (isObject(parent) && isObject(nodeValue)) {
      for (const key in nodeValue) {
        this.reactiveBinder(nodeValue, key)
      }
    } else {
      Object.defineProperty(parent, child, {
        enumerable: true,
        configurable: true,
        get() {
          return nodeValue
        },
        set: (newValue) => {
          nodeValue = newValue
          this.dispatchReactiveChange(child)
        }
      })
    }
  }

  Xue.prototype.walkInDom = function (node) {
    if (isText(node)) {
      node.textContent = this.getFinalText(node)
    } else {
      node.childNodes.forEach(elm => {
        this.walkInDom(elm)
      })
    }
  }

  Xue.prototype.getFinalText = function (textNode) {
    return (textNode.textContent || textNode)
      .replace(/{{ *([a-z|A-Z|\.]+) *}}/g, (match, extract) => {

        extract = extract.split('.')
        let value = this
        let lastKey

        extract.forEach(key => {
          value = value[key]
          lastKey = key
        })

        if (textNode.textContent) {
          fakeVirtualDOM[lastKey] = {
            node: textNode,
            text: textNode.textContent,
          }
        }

        return value
      })
  }

  return Xue
})
