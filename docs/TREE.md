# Tree

I've been exploring how to insert layout information to the DOM itself, but
while this works for simple block models, or just majority of UI frameworks
(Think anything else other than the web...), it really didn't work well.

Turns out the idea of equating DOM nodes to layout nodes doesn't work well;
layouting out nodes doesn't really correspond to DOM tree itself due to the
presence of pseudo elements, coexistence between inline/block flows, etc.

Instead, the entire layout engine needs to maintain a completely separate
"layout tree" to apply those CSS layout rules. For instance, the following
HTML document:

```html
<div>
  Hello,
  <strong
    >world!
    <div>And this is a line.</div>
    You shouldn't do this.</strong
  >
  Probably.
</div>
```

Has a div node in between the strong node. Layout engines simply splits the
strong node into two, and it would get displayed like this:

- Hello, **world!**
- **And this is a line.**
- **You shouldn't do this.** Probably.

This seems like a normal behavior, and it is. However, to explain this, the
layout engine actually "cuts off" the inline flow whenever block elements
are encountered.

- Block (div)
  - Inline box
    - Hello,
    - **world!** (strong)
  - Block (div) (strong)
    - Inline box
      - **And this is a line.**
  - Inline box
    - **You shouldn't do this.** (strong)
    - Probably.

Each inline box is able to create line boxes and put text however they see like
it.

As you can see, this representation is quite different from DOM, and it can be
dynamically manipulated by CSS rules itself.

Therefore, it is necessary to create few different types of trees other than
DOM, hidden from the user (the JS environment).

## Layout tree

The DOM and CSSOM are translated into layout trees, which resolves semantics
and rules of CSS layouting. It should resolve CSS rules, inheritance,
block/inline conversion at this layer.

There would be few types in this tree:

- Block node
- Inline box
- Inline-block node
- Text

The inline node doesn't get represented as individual nodes in this tree, but
instead as "attributes" that can be applied to each node. This is easier to
process while doing actual layouts (laying out each words in the lines).

Each node should have CSS rules already resolved, and get boiled down to CSS
property that the layout engine can use. However, relative units, and to extent,
calc() cannot be resolved yet.

Each node should be placed following the CSS visual formatting model, following
the forementioned tree.

The pseudo elements, if available, should also be placed in this layer. The
DOM node shall contain the pointer to the layout tree, to provide various APIs
(bounding rects, computed styles, etc) to the user.

## Line box generation

After the layout tree is generated, the actual layout is performed. This is way
too extensive to describe in detail in here, but, to simplify it:

Starting from the root node (usually the body element), block formatting context
is used to lay out nodes from the top to the bottom. It would traverse the
DOM nodes, layout block nodes by allocating height, etc.

However, when the layout engine encounters an inline box, it must completely
change its formatting engine. It is now instead works like a typewriter -
digesting each text node, word by word (or letter by letter), and creating
lines on the fly to put those nodes. In other words, an inline box would consist
of a list of line boxes, which would contain text. Each text node can have
"attributes" of inline nodes, which is used to determine the style of the text.

Optimization could be done by using the concept of "text run" - one strip of
text that doesn't change in attributes, nor having anything else in between like
inline blocks.

So, the "inline box" of the layout tree has two different trees - one for
pre-layout nodes, and one for line boxes that are ready to render. It could be
said as an additional type of tree inside the layout tree.

### Inline nodes

Inline nodes, like `<strong>` are dealt as attributes in the said layout logic.
This works, however, those inline nodes also needs box data, for mouse collision
detection or simply sending the data to JS. Though, simply speaking, it can
simply select all text runs and inline-blocks and report its box data - and
it aligns with how inline nodes work.

### Inline-block nodes

Inline-block nodes, like simple `<img>` nodes, or just user-set div nodes, are
simply dealt as a single character in the inline flow. The contents should be
placed first to determine its width/height first, however, once done, it's just
the same as a regular text character, albeit it cannot be included in a text run.
