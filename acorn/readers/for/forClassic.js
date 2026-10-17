import { tokTypes as tt } from 'acorn';
import { parseLoopBody } from "../forHandler.js"

// normal for loop
// are there actually names for these? ive js been saying "for" and "loop through array/obj",
export default function forClassic(dis, node, init) {
    dis.expect(tt.semi);
    const test = dis.type === tt.semi ? null : dis.parseExpression();
    dis.expect(tt.semi);
    const update = dis.type === tt.parenR ? null : dis.parseExpression();
    dis.expect(tt.parenR);
    const body = parseLoopBody(dis);

    node.init = init;
    node.test = test;
    node.update = update;
    node.body = body;
    return dis.finishNode(node, 'JSXForStatement');
}
