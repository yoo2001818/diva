import selectorGrammar from './selectorGrammar.js';
import nearley from 'nearley';

const grammar = nearley.Grammar.fromCompiled(selectorGrammar);

export function parseSelectors(input: string) {
  const parser = new nearley.Parser(grammar);
  parser.feed(input);
  if (parser.results.length >= 2) {
    throw new Error('Parser result is ambigous');
  }
  if (parser.results.length === 0) {
    throw new Error('Parser result is empty');
  }
  return parser.results[0];
}

export interface ComplexSelector {
  type: 'complexSelector';
  children: ComplexSelectorChild[];
}

export type ComplexSelectorChild = Combinator | CompoundSelector;

export interface CompoundSelector {
  type: 'compoundSelector';
  children: SimpleSelector[];
}

export type SimpleSelector =
  | TypeSelector
  | IdSelector
  | ClassSelector
  | AttributeSelector
  | PseudoSelector;

export interface Combinator {
  type: 'combinator';
  name: '>' | '+' | '~' | '||' | ' ';
}

export interface TypeSelector {
  type: 'typeSelector';
  name: string;
}

export interface IdSelector {
  type: 'idSelector';
  name: string;
}

export interface ClassSelector {
  type: 'classSelector';
  name: string;
}

export interface AttributeSelector {
  type: 'attributeSelector';
  name: string;
  matcher?: '=' | '~=' | '|=' | '^=' | '$=' | '*=';
  value?: string;
  modifier?: 'i' | 's';
}

export interface PseudoSelector {
  type: 'pseudoSelector';
  name: string;
}
