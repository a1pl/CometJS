import { tokTypes as tt } from 'acorn';

export default function ifWrapper(asd) {
    const node = dis.startNode();
    dis.next()
    // if (here) {}
    dis.expect(tt.paranL)
    const condition = dis.parseExpression();
    dis.expect(tt.parenR);

    // if () {here}
    dis.expect(tt.braceL);
    const consequent = [];
    while (!dis.eat(tt.braceR)) {
        consequent.push(dis.parseJSXChild(null));
    }
    
    let alternate = null;
    if (dis.type === tt._else) {
        dis.next(); // consume 'else'

        // check for else if
        if (dis.type === tt._if) {
            // parse
            const elseIfNode = dis.startNode();
            dis.next(); // consume 'if'
            dis.expect(tt.parenL);
            const elseIfTest = dis.parseExpression();
            dis.expect(tt.parenR);
            
            dis.expect(tt.braceL);
            const elseIfBody = [];
            while (!dis.eat(tt.braceR)) {
                elseIfBody.push(dis.parseJSXChild(null));
            }

            alternate = dis.finishNode(elseIfNode, 'JSXIfStatement', {
                test: elseIfTest,
                consequent: elseIfBody,
                alternate: null,
            });
        } else {
            // treat as else if (true)
            dis.expect(tt.braceL);
            const elseBody = [];
            while (!dis.eat(tt.braceR)) {
                elseBody.push(dis.parseJSXChild(null));
            }

            const trueNode = dis.startNode();
            alternate = dis.finishNode(trueNode, 'JSXIfStatement', {
                test: { type: 'Literal', value: true },
                consequent: elseBody,
                alternate: null,
            });
        }
    }
}