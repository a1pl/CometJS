
# liquidjs

An experimental JavaScript framework, inspired by old [tsrx](https://tsrx.dev) and Svelte syntax, while using @solidjs/signals for state.

---

## Features

### Conditionals and statements inside JSX

Write `if`, `for`, and nested logic directly inside your markup:

```jsx
export default function (x) {
  return <div>
    if (x == 1) {
      <h1>"x is 1"</h1>
    } else {
      for (const num of [...Array(x + 1).keys()]) {
        if (num != x) {
          <h1>"x is not 1, but is above " + num</h1>
        } else {
          <h1>"x is not 1, but is " + num</h1>
        }
      }
    }
  </div>
}
```

### Svelte‑like reactivity

Use `#state` to create reactive signals (inspired by Svelte 5 runes):

```jsx
export default function Counter() {
  let count = #state(0);

  // events are lowercase, as in html.
  return <button onclick={() => count++}>
    {"the number is " + count + ", click to increase it"}
  </button>
}
```

In liquidjs `#state` compiles to `@solidjs/signals` for fine‑grained reactivity.

### Customization
liquidjs's configuration file is (planned to be) very customizable, with almost every feature created/planned being able to be customized

Old tsrx.dev style jsx elements (<div>"string here" + variable</div>) can also be swapped out for more standard jsx elements with {} used for evals and unquoted string literals being legal.

---

## Runtime (`runtime.js`)

`runtime.js` is a very lightweight DOM registry. Each component gets:

- A **ULID** (uuid alternative that's more easily sortable) assigned at creation.
- A **wrapper `<div id="x-{ulid}">`** so we can move components around the DOM without re‑rendering their contents.
- A place in a **linked list** that tracks component order, making reordering performant.

The file also contains **sandboxed document API wrappers**, meaning each component gets its own helpers to directly modify its output DOM.

Because of the wrapper divs, CSS is applied **programatically** at element creation (through `runtime.js`). This is a bit of a hack to make the wrapper‑div and sandboxed‑API approach work without breaking styles, but could potentially be expanded on in runtime.js to give components more control over styling.

---

## Libraries Used

- [acorn](https://github.com/acornjs/acorn) - JavaScript parser
- [acorn-typescript](https://github.com/sveltejs/acorn-typescript) - TypeScript support for Acorn
- [acorn-jsx](https://github.com/acornjs/acorn-jsx) - JSX support for Acorn, used by our acorn plugin
- [gogocode](https://github.com/thx/gogocode) - used for modifying Acorn output for lsx
- [@solidjs/signals](https://www.npmjs.com/package/@solidjs/signals) - reactivity engine

---

## Type Safety

Type safety is **not enforced** by the framework. However, if TypeScript usage is detected inside a `.lsx` file, an attempt to preserve and emit type information for downstream tooling is made.

---

## Getting Started

Unfortunately, nothing has been written yet.
Support is planned for Vite, however.