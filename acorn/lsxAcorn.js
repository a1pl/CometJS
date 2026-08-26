import { tokTypes as tt } from 'acorn'
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import { forWrapper } from "./readers/forHandler.js"
import { ifWrapper } from "./readers/ifHandler.js" // not actually a wrapper, just keeping it tidy

export default function lsxAcornPlugin(Parser) {
  return class extends Parser {
        parseJSXChild(node) {
            // for keyword
            if (this.type === tt._for) {
                return this.parseJSXForStatement();
            }
            // if keyword
            if (this.type === tt._if) {
                return this.parseJSXIfStatement();
            }
            return super.parseJSXChild(node);
        }
        parseJSXForStatement() {
            const node = this.startNode();
            this.next();
            forWrapper(this)
            this.expect(tt.parenL);
            const count = 
            this.expect(tt.parenR);
        }
        parseJSXIfStatement() {
            const node = this.startNode();
            this.next();
            ifWrapper(this)
            this.expect(tt.parenL);
            const count = 
            this.expect(tt.parenR);
        }
  };
}

export const LiquidParser = Parser.extend(jsx(), lsxAcornPlugin);
