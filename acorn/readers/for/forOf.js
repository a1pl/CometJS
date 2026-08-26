import { tokTypes as tt } from 'acorn';

export default function (dis) {
    const node = dis.startNode();

    dis.expect(tt.paranL)
    let declr;
    if (dis.type === tt._const) { declr = 'const'; dis.next(); }
    else if (dis.type === tt._let) { declr = 'let'; dis.next(); }
    else if (dis.type === tt._var) { declr = 'var'; dis.next(); }
    else dis.raise(dis.pos, "expected variable declaration");
    
    // parse name
    const left = dis.parseBindingAtom();

    dis.expect(tt._of);
    const right = dis.parseExpression();
    dis.expect(tt.parenR);

    // parse body
    dis.expect(tt.braceL);
    const body = [];
    while (!dis.eat(tt.braceR)) {
        body.push(dis.parseJSXChild(null));
    }

    return dis.finishNode(node, 'JSXForOfStatement', {
        kind,
        left,
        right,
        body,
    });
}