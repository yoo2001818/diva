# Yet Another Layout Tree

Now that it's possible to resolve CSS styles from stylesheets, it's time to
implement layout trees again. There are multiple concerns to deal with.

- Pseudo elements
- Resolving styles
- Formatting context
- Inline/block/inline-block handling

Let's formalize pseudo elements first, as it requires significant
considerations regarding the structure.

## Pseudo Elements

There are numerous pseudo elements on the CSS spec, but let's focus on the most
frequently used pseudo element - before and after. It's appended as if it were
an element inside the parent element, but it's completely virtual. In other
words, while layouting, it should be treated as if it's an ordinary element.

However, the current structure demands that each node is a real element. This is
simply not true - for instance, CharacterData (and Text) alone needs reconsideration
because they also need styles and bounding boxes. Furthermore the formating
context alone makes it difficult to reason with elements, as they can create
anonymous structures to format the element correctly.

Therefore, it's strictly necessary to split up the DOM and internal layout
representation, while maintaining the semantics of CSS and DOM simultaneously.

As there would be an independent layout representation, it would be trivial to
implement pseudo elements on it.

### Style hierarchy

At this point, the DOM structure has been already decoupled from the layout
engine. However, the CSS hierarchy / cascading logic still demands that the
DOM hierarchy is enforced. However, pseudo elements and text nodes make it
challenging to implement the hierarchy as-is.

One possible approach can be that, pseudo elements are always one-level deep
and it's quite trivial to add an additional criteria on top of the parent.
That is, each element could contain a `Map<string, StyleDict>` to maintain
pseudo element styles.

On the other hand, text nodes never need to maintain text style directly. They
can directly use the corresponding node's style, and the text's own hierarchy
is irrelevant.

## Resolving styles

There are numerous steps for calculating style property values, which should be
also dealt with.

1. Specified value - The raw property value decided by the CSS
2. Computed value - Intermediate calculated values if it doesn't involve percentages
3. Used value - Calculated value in pixels that are actually used by the layout
4. Actual value / resolved value - Let's not even go here yet..

Specified values doesn't touch layouts at all; Computed values only need to
resolve font sizes. However, used values depend on the node's actual size
information, which the layout engine needs to fill in.

I think it's best to withhold the architectural decision about it until I
actually finish a functional layout engine.

## Formatting context

Which brings the question down to the formatting context, and the actual artifact
(rendered data) coming from it.

Each formatting context is fed with nodes, and the formatting context itself will
make decisions about where to put the nodes, the size of itself, etc. It isn't
strictly necessary to make a formatting context a persistent class - it can be
a function that emits an layout tree, for instance. However, to reason with
size information, especially when it comes to inlines (which may have to run
multiple times to get the size), it could be beneficial to make it a class.

There are two formatting contexts that I'm mostly concerned about:

- Block formatting context
- Inline formatting context

Block flows top to bottom, inline flows left to right. There are some
anonymous transitional boxes to handle inline objects inside blocks:

- Inline box
- Line box

Inline box can only contain line boxes, and line boxes can only contain inline
elements and text glyphs. It should stop the moment it encounters a block element.

Generally, a formatting context can be considered like a stream. That is to
say, it accepts a tape of all the possible node's entry/exit points, text data,
and it can peek, pull, or reject the node. However I'm not sure if actually
materializing this concept as an array, queue, etc, is a good idea. Block nodes
won't have a good time processing that. Perhaps it'd be beneficial to create
a simple "walker" class, which walks the sibling layer by default, but drills
down to every node with entry/exit markers the moment inline nodes are
encountered.

See this rather jarring example showing why this may be necessary:

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

Which should be displayed like this:

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

This is quite difficult to reason with. As you can see, inline elements don't
have a strong concept of a "box", but it's defined very loosely - it practically
functions like an annotation, not an actual node.

This suggests that, even block formatting contexts aren't free from dealing with
this "walker" - it needs to drill down inline nodes, while keeping the block
nodes.
