
;(function (root, factory) {
  root.Xue = factory()
})(this /* window */, function () {

  window.fakeVirtualDOM = {}

  const isText = node => (
    node.nodeName === '#text' &&
    !!node.textContent.trim()
  )

  const isObject = node => (
    node !== null &&
    typeof node === 'object'
  )

  function Xue (conf) {
    this.$el = document.querySelector(conf.el)

    for (const key in conf.data) {
      this[key] = conf.data[key]
    }

    for (const key in conf.data) {
      this.reactiveBinder(this, key)
    }

    this.walkInDom(this.$el)
  }

  Xue.prototype.dispatchChange = function (nodeKey) {
    const { node, text } = fakeVirtualDOM[nodeKey]
    node.textContent = this.getFinalText(text)
  }

  Xue.prototype.reactiveBinder = function (parent, child) {
    let nodeValue = parent[child]

    if (isObject(parent) && isObject(nodeValue)) {
      
      for (const subChildNode in nodeValue)
        this.reactiveBinder(nodeValue, subChildNode)

    } else {
      Object.defineProperty(parent, child, {
        enumerable: true,
        configurable: true,
        get () {
          return nodeValue
        },
        set: (newValue) => {
          nodeValue = newValue
          this.dispatchChange(child)
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
          text: textNode.textContent,
          node: textNode
        }
      }

      return value
    })
  }

  return Xue
})
