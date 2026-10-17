import { tokTypes as tt, tokContexts, TokContext, isNewLine } from 'acorn'
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import forWrapper from "./readers/forHandler.js"
import ifWrapper, { elseWrapper } from "./readers/ifHandler.js" // not actually a wrapper, just keeping it consistent

const forMark = { csx: 'for' };
const ifMark = { csx: 'if' };
const elseMark = { csx: 'else' };
const keywordMarks = { for: forMark, if: ifMark, else: elseMark };
// w deepseek for the regex slop
const keywordRe = /(for|if)\s*\(|(else)(?=\s*(?:\{|if\s*\())/y;
const elseAheadRe = /else(?=\s*(?:\{|if\s*\())/y;

export default function csxAcornPlugin(Parser) {
  const tok = Parser.acornJsx.tokTypes;

  const tc_block = new TokContext('{csx block}', false, true, p => p.csx_readText(true));

  return class extends Parser {
        jsx_readToken() {
            return this.csx_readText(false);
        }

        // paste of acorn-jsx jsx_readToken plus keyword bracket checks
        csx_readText(inBlock) {
            let out = '', chunkStart = this.pos;
            for (;;) {
                if (this.pos >= this.input.length)
                    this.raise(this.start, inBlock ? 'Unterminated block' : 'Unterminated JSX contents');
                const ch = this.input.charCodeAt(this.pos);

                keywordRe.lastIndex = this.pos;
                const m = keywordRe.exec(this.input);
                const kw = m && (m[1] ?? m[2]);
                if (kw) {
                    if (this.pos === this.start) {
                        this.pos += kw.length;
                        return this.finishToken(tok.jsxText, keywordMarks[kw]);
                    }
                    out += this.input.slice(chunkStart, this.pos);
                    return this.finishToken(tok.jsxText, out);
                }

                switch (ch) {
                case 60: // <
                case 123: // {
                    if (this.pos === this.start) {
                        if (ch === 60 && (inBlock || this.exprAllowed)) {
                            ++this.pos;
                            return this.finishToken(tok.jsxTagStart);
                        }
                        return this.getTokenFromCode(ch);
                    }
                    out += this.input.slice(chunkStart, this.pos);
                    return this.finishToken(tok.jsxText, out);

                case 125: // }
                    if (inBlock) {
                        if (this.pos === this.start) return this.getTokenFromCode(ch);
                        out += this.input.slice(chunkStart, this.pos);
                        return this.finishToken(tok.jsxText, out);
                    }
                    // falls through
                case 62: // >
                    this.raise(
                        this.pos,
                        "Unexpected token `" + this.input[this.pos] + "`. Did you mean `" +
                        (ch === 62 ? "&gt;" : "&rbrace;") + "` or " + "`{\"" + this.input[this.pos] + "\"}" + "`?"
                    );

                case 38: // &
                    out += this.input.slice(chunkStart, this.pos);
                    out += this.jsx_readEntity();
                    chunkStart = this.pos;
                    break;

                default:
                    if (isNewLine(ch)) {
                        out += this.input.slice(chunkStart, this.pos);
                        out += this.jsx_readNewLine(true);
                        chunkStart = this.pos;
                    } else {
                        ++this.pos;
                    }
                }
            }
        }

        // pick up acorn jsx markers
        parseExprAtom(refDestructuringErrors, forInit, forNew) {
            if (this.type === tok.jsxText) {
                if (this.value === forMark) return this.parseJSXForStatement();
                if (this.value === ifMark) return this.parseJSXIfStatement();
                if (this.value === elseMark) this.unexpected(); // else with no if, edgecase handling!!!!!!
            }
            return super.parseExprAtom(refDestructuringErrors, forInit, forNew);
        }

        // one child inside a for/if body
        parseJSXChild() {
            if (this.type === tok.jsxTagStart) return this.jsx_parseElement();
            if (this.type === tok.jsxText) return this.parseExprAtom(); // text/nested for
            if (this.type === tt.braceL) return this.jsx_parseExpressionContainer();
            this.unexpected();
        }

        parseJSXForStatement() {
            this.csx_enterHead();
            return forWrapper(this);
        }

        // read () as normal js
        csx_enterHead() {
            (this.csxHeads ??= []).push(this.context.length);
            this.context.push(tokContexts.b_stat);
        }

        parseCSXBlock() {
            if (this.type !== tt.braceL) this.unexpected();
            this.context.length = this.csxHeads.pop();
            this.context.push(tc_block);
            this.next();

            const body = [];
            while (!this.eat(tt.braceR)) {
                body.push(this.parseJSXChild());
            }
            return body;
        }

        parseJSXIfStatement() {
            this.csx_enterHead();
            return ifWrapper(this);
        }

        parseCSXElse() {
            // TODO:decide whether whitespace before else is text or not
            if (this.type === tok.jsxText && typeof this.value === 'string' && !this.value.trim()) {
                elseAheadRe.lastIndex = this.end;
                if (elseAheadRe.test(this.input)) this.next();
            }
            if (this.type !== tok.jsxText || this.value !== elseMark) return null;
            this.csx_enterHead();
            return elseWrapper(this);
        }
  };
}

export const CometParser = Parser.extend(jsx(), csxAcornPlugin);
