import { tokTypes as tt } from 'acorn';
import forOf from "./for/forOf.js"
import forIn from "./for/forIn.js"
import forClassic from "./for/forClassic.js"

// parses for
export default function forWrapper(dis) {
    const node = dis.startNode();
    dis.next(); // consume 'for'
    dis.expect(tt.parenL);

    // for (; )
    if (dis.type === tt.semi) return forClassic(dis, node, null);

    let init;
    // acorn is weird and 'let' gets parsed weirdly
    const isLet = dis.isLet();
    if (isLet || dis.type === tt._const || dis.type === tt._var) {
        const kind = isLet ? 'let' : dis.type.keyword;
        init = dis.startNode();
        dis.next();
        dis.parseVar(init, true, kind);
        dis.finishNode(init, 'VariableDeclaration');
    } else {
        // for (i = 0;) or for (x of)
        init = dis.parseExpression(true);
    }

    if (dis.isContextual("of")) {
        dis.next();
        return forOf(dis, node, init);
    }
    if (dis.eat(tt._in)) return forIn(dis, node, init);
    return forClassic(dis, node, init);
}

export function parseLoopBody(dis) {
    return dis.parseCSXBlock();
}

export function loopLeft(dis, init) {
    if (init.type === 'VariableDeclaration') {
        if (init.declarations.length !== 1 || init.declarations[0].init)
            dis.raise(init.start, "for-of/for-in takes exactly one variable without an initializer");
        return { kind: init.kind, left: init.declarations[0].id };
    }
    return { kind: null, left: dis.toAssignable(init, false) };
}
