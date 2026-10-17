export default function cart(list) {
    return <div>
        for (const item of list) {
            <div>item.name</div>
        }
    </div>
}

//compiles into
/*
import { createRoot, createEffect, mapArray } from "@solidjs/signals";

export default function cart(listSignal) {
  return createRoot(() => {
    const container = document.createElement('div');
    const mapped = mapArray(listSignal, (item) => {
      const child = document.createElement('div');
      child.textContent = item.name;
      return child;
    });

    createEffect(() => {
      container.replaceChildren(...mapped());
    });

    return container;
  });
}
*/