import { Ulid } from 'id128';
import { list } from "live-list"


var tree = new List();

export function createWrapper(parent = document.body) {
    let x = Ulid.generate().toCanonical()
    const newDiv = document.createElement("div");
    newDiv.id = "x-" + x;
    parent.appendChild(newDiv);
    tree.push(x)
    return x;
}

export function removeWrapper(id) {
    const wrapper = document.getElementById(`x-${id}`);
    if (wrapper) wrapper.remove();
    tree.remove(id);
}

export function getComponent(id) {
    return tree.get(id);
}

export function appendComponent(id, component) {
    document.getElementById(`x-${id}`).appendChild(component)
}

export function h(tag, props = {}, ...children) {
    let propsMap = new Map(Object.entries(props)) 
    if (typeof tag === 'function') {
        const result = tag(props, children);
        if (Array.isArray(result)) {
        const frag = document.createDocumentFragment();
        for (const item of result.flat(Infinity)) {
            if (item instanceof Node) frag.appendChild(item);
        }
            return frag;
        }
        return result; 
    }
    const output = document.createElement(tag);
    for (const attribute of [...propsMap.keys()]) {
        output.setAttribute(attribute, propsMap.get(attribute))  
    }
    const flatChildren = children.flat(Infinity);
    for (const child of flatChildren) {
        if (child == null || child === false) continue;
        if (child instanceof Node) {
            output.appendChild(child);
        } else {
            output.appendChild(document.createTextNode(String(child)));
        }
    }
}

export function render(component, target) {
    const result = typeof component === 'function' ? component() : component;
    if (result instanceof Node) target.appendChild(result);
}
