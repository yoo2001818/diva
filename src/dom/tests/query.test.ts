import { describe, it, expect, beforeEach } from 'vitest';
import { Element } from '../Element';
import { Document } from '../Document';

describe('Handles Element.matches()', () => {
  let document: Document;
  let div: Element
  let span: Element;

  beforeEach(() => {
    document = new Document();

    div = document.createElement('div');
    div.id = 'test-div';
    div.classList.add('container', 'active');

    span = document.createElement('span');
    span.setAttribute('data-role', 'info');
    span.classList.add('highlight');
    div.appendChild(span);

    document.documentElement!.appendChild(div);
  });

  it('should match an ID selector', () => {
    expect(div.matches('#test-div')).toBe(true);
  });

  it('should match a class selector', () => {
    expect(div.matches('.container.active')).toBe(true);
  });

  it('should match an attribute selector', () => {
    expect(span.matches('[data-role="info"]')).toBe(true);
    expect(span.matches('[data-role^="inf"]')).toBe(true); // Starts with
    expect(span.matches('[data-role$="o"]')).toBe(true);   // Ends with
    expect(span.matches('[data-role*="x"]')).toBe(false);  // Doesn't contain 'n'
  });

  it('should match a descendant selector', () => {
    expect(span.matches('div span')).toBe(true);
  });

  it('should match a type selector', () => {
    expect(span.matches('span')).toBe(true);
    expect(div.matches('span')).toBe(false);
  });
});
