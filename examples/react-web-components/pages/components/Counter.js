import React, {useRef, useEffect} from 'react'

const ImperativeCounter =
  typeof window === 'undefined'
    ? () => {}
    : class extends HTMLElement {
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

const Counter = () => {
  useEffect(() => {
    window.customElements.define('i-counter', ImperativeCounter)
  }, [])

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

export default Counter
