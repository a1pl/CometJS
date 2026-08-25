export default function myJsxForPlugin(Parser) {
  return class extends Parser {
        parseJSXChild(node) {
            // for keyword
            if (this.type === tt._for) {
                return this.parseJSXForStatement();
            }
            return super.parseJSXChild(node);
        }
            
  };
}