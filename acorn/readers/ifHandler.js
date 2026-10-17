import { tokTypes as tt } from 'acorn';

// elseif is alt JJSXIfStatement, plain else is JSXIfStatement with test true cuz im smart
export default function ifWrapper(dis) {
    const node = dis.startNode();
    dis.next(); // consume 'if'
    dis.expect(tt.parenL);
    node.test = dis.parseExpression();
    dis.expect(tt.parenR);
    node.consequent = dis.parseCSXBlock();
    node.alternate = dis.parseCSXElse();
    return dis.finishNode(node, 'JSXIfStatement');
}

export function elseWrapper(dis) {
    dis.next();

    // else if
    if (dis.type === tt._if) return ifWrapper(dis);
    const node = dis.startNode();
    node.test = { type: 'Literal', value: true, raw: 'true' };
    node.consequent = dis.parseCSXBlock();
    node.alternate = null;
    return dis.finishNode(node, 'JSXIfStatement');
}
