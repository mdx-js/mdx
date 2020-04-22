import React, {useRef} from 'react'

class ImperativeCounter extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({mode: 'open'})
    this.currentCount = 0
    this.update()
  }

  update() {
    this.shadow.innerHTML = `<div><h2>Count: ${this.currentCount}</h2></div>`
  }

  increment() {
    this.currentCount++
    this.update()
  }
}

window.customElements.define('i-counter', ImperativeCounter)

export const RenderCounter = () => {
  const counterElement = useRef(null)
  return (
    <div>
      <i-counter ref={counterElement}></i-counter>
      <button onClick={() => counterElement.current.increment()}>
        Increment
      </button>
    </div>
  )
}

export default () => (
  <>
    <RenderCounter />
  </>
)
