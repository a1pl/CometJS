import { tokTypes as tt } from 'acorn';
import { parseLoopBody, loopLeft } from "../forHandler.js"

// for (const key in obj) {}
export default function forIn(dis, node, init) {
    const { kind, left } = loopLeft(dis, init);
    const right = dis.parseExpression();
    dis.expect(tt.parenR);
    const body = parseLoopBody(dis);

    node.kind = kind;
    node.left = left;
    node.right = right;
    node.body = body;
    return dis.finishNode(node, 'JSXForInStatement');
}
