import { CSSStyleDeclaration } from './CSSStyleDeclaration';
import { CSSStyleSheet } from './CSSStyleSheet';
import { parse, Root, Rule } from 'postcss';

export class CSSRule {
  _cssText: string = '';
  _parentStyleSheet: CSSStyleSheet | null = null;

  constructor(cssText: string) {
    this._cssText = cssText;
  }

  get parentRule(): CSSRule | null {
    return null;
  }

  get parentStyleSheet(): CSSStyleSheet | null {
    return this._parentStyleSheet;
  }

  get cssText(): string {
    return this._cssText;
  }

  set cssText(_value: string) {
    // Must do nothing
  }
}

export class CSSStyleRule extends CSSRule {
  selectorText: string = '';
  style: CSSStyleDeclaration = new CSSStyleDeclaration();

  constructor(node: Rule) {
    super(node.toString());
    this.selectorText = node.selector;
    node.nodes.forEach((node) => {
      if (node.type === 'decl') {
        this.style.setProperty(
          node.prop,
          node.value,
          node.important ? 'important' : '',
        );
      }
    });
  }
}

export function parseCSSRules(text: string): CSSRule[] {
  const ast = parse(text) as Root;
  const output: CSSRule[] = [];
  ast.nodes.forEach((node) => {
    if (node.type === 'rule') {
      output.push(new CSSStyleRule(node));
    }
  });
  return output;
}
