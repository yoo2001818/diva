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

Judging by this requirement, I think it'd be favorable to create a "walker"
class with this shape:

```ts
type WalkerItem =
  | { type: 'start'; stack: Element[]; element: Element }
  | { type: 'end'; stack: Element[]; element: Element }
  | { type: 'text'; stack: Element[]; text: Text; index: number };

interface Walker {
  peek(): WalkerItem | null;
  consume(drillDown: boolean): void;
  consumeText(length: string): void;
}
```

Which, can be used like this to walk the tree and generate layout boxes:

- 0 BFC: (start, div) enter BFC (with new Walker)
- 0.0 BFC: (text, "Hello, ") create inline box, (don't consume), enter IFC
- 0.0.0 IFC: (text, "Hello, ") create line box, (don't consume), enter line
- 0.0.0.0 Line: (text, "Hello, ") create text run, (consume all letters)
- 0.0.0.1 Line: (start, strong) create inline start marker, (consume, drill down)
- 0.0.0.2 Line: (text, "world!") create text run, (consume all letters)
- 0.0.0.3 Line: (start, div) exit line (don't consume)
- 0.0.1 IFC: (start, div) exit IFC (don't consume)
- 0.1 BFC: (start, div) create block node, (consume), enter BFC (with new Walker inside)
- 0.1.0 BFC2: (text, "And this is a line.") create inline box, (don't consume), enter IFC
- 0.1.0.0 IFC: (text, "And this is a line.") create line box, (don't consume), enter line
- 0.1.0.0.0 Line: (text, "And this is a line.") create text run, (consume all letters)
- 0.1.0.0.1 Line: (null) exit line (don't consume)
- 0.1.0.1 IFC: (null) exit IFC (don't consume)
- 0.1.1 BFC2: (null) exit BFC (consume)
- 0.2 BFC: (text, "You shouldn't do this.") create inline box, (don't consume), enter IFC
- 0.2.0 IFC: (text, "You shouldn't do this.") create line box, (don't consume), enter line
- 0.2.0.0 Line: (text, "You shouldn't do this.") create text run, (consume all letters)
- 0.2.0.1 Line: (end, strong) create inline end marker (consume)
- 0.2.0.2 Line: (text, "Probably.") create text run, (consume all letters)
- 0.2.0.3 Line: (null) exit line (don't consume)
- 0.2.1 IFC: (null) exit IFC (don't consume)
- 0.3 BFC: (null) exit BFC (consume)

It's so verbose. But as you can see, walkers are simply necessary to implement
inline boxes, while allowing interleaving inline and block nodes.

Using this Walker structure, it would be a whole lot easier to implement BFC/IFC
logic. Layouting is yet another beast to tame, but at least it can be used to
create a layout tree that correctly represents how it should be displayed.

## Position

Also, I haven't even thought about `display: none`, `position: absolute` and
other sadness I need to deal with. `display: none` is literally nothing, so
it's fine - but what about `position: absolute`? Where does it even reside in
the layout tree? What's more troubling is that if no `top`, `left`, ... are
specified, absolute nodes must be placed on where it should reside if the
position is static. So it isn't completely "outside" of the layout tree as well.

However, this is outside the scope of a layout tree - it should be determined
while actually determining positions of each node, and that absolute elements
can be seen as an element that takes the position, but doesn't contribute to the
sizing whatsoever.

... That is to say, let's think about this again when I actually finish building
the layout tree.

## Layout

Let's say that the app finished building a layout tree. How would it actually
fill out position and size information? Also: as you can see from the presence
of line boxes, inline formatting contexts can be freely change its composition
depending its width. I think it's best to approach it first without implementing
line wraps, as that would bring the font horror and it's mostly self
contained inside IFCs.

I haven't looked it up precisely, but CSS actually requires to determine the
"fit-content" size even in CSS 2.1, when `position: absolute` is specified. Or
`inline-block`. That is, "just keep adding content without thinking about line
wraps" is actually necessary to determine the parent's width. So this approach
could work for initial implementation.

## Implementation Ideas

Let's assess the current code situation and see what I can do to implement all
of this. There are working implementation that I'd like to keep:

- CSSOM
- DOM
- CSSStyleDeclaration

And there are chaotic mess that are experimental and subject to change:

- "Box"
- LayoutNode
- StyleData
- FormattingContext

First of all, I need to get rid of existing layout tree ideas because it's
structually invalid, and simply obsolete.

### Style Dictionary

I think I'd start by decoupling style dictionary from everything else.
That is, while some CSS values simply
need full layout engine computation due to "%" needing precise dimensions, this
is usually an edge case and it's generally easier to postpone that. That is,
other than "%", everything else can be boil down to "px". If "%" is involved,
the layout engine itself would need to write that to a special dictionary and
re-run the reflow logic with that data. An auxilary dictionary specific for
resolving complicated values.

Also, a "style dictionary" is specific for each (pseudo) element, not each
layout node. Likewise, each Element can own the following property:

```ts
interface Element {
  _pseudoStyleDictMap: Map<string, StyleDictTBD>;
  _styleDict: StyleDictTBD;
}
```

LayoutNode can store `StyleDictTBD` directly for its own use, as it's necessary
for text nodes that doesn't directly own styles.

### Smarter Style Dictionary?

As of now, a "StyleDict" is an interface. It can be a map for base declarations,
or it can do "smart" things, like resolving cascading or inheritance. For the
layout engine itself, it never needs to make that distinction, but the fact that
it is "smart" - it would ideally just pass convenient "px" or "rgb" values that
can be directly used by the layout engine. As such, it could be meaningful to
create and name a class that simply does that. Not sure about the name though.

To reiterate its requirements:

1. Specified value - The raw property value decided by the CSS
   1. Directly specified style attribute
   2. Cascaded CSS value
   3. Inherited CSS value
2. Computed value - Intermediate calculated values if it doesn't involve percentages
3. Used value - Calculated value in pixels that are actually used by the layout
4. Actual value / resolved value - It should store auxilary values provided by the layout engine

### Formatting Context and Layout Nodes

The idea of layout nodes is simply necessary, but it does wrong things right now.
However, I think the "BFC" and "IFC" is basically equivalent to each layout node,
and that it can make layout decisions after storing all the children into them.
That is, each "BlockNode" itself is a BFC, and a "InlineBoxNode" is an IFC.

After walking all the nodes, it can independently make layout decisions with
the collected children list. Which would be difficult, but all the requirements
are there. However, I think if I ditch "%" and "float", it could be quite trivial
to do so.

Except IFCs. It needs line boxes, so it needs a "not-line" children list, and
"line" children list. Which could be trivial to convert between two, again, except
the TextRunNode which can be split up. Perhaps it'd be better to have two kinds
of TextRunNode, one for "not-line" representation, and for "split-up" line
representation.

Also inline elements. Which is dealt as an "annotation" as told before, so it won't
have its own layout nodes, but affected layout nodes would depend on the inline
element's style dictionary (that is, marked as a direct parent). Which brings
another concern about how "client rects" are defined for them. I think each line
node would need to manage a "virtual layout node" to correctly report the
location of the client rect for inline elements.

### About `getClientRects()`...

I also need to implement such functions that maps LayoutNode back to the node
itself. This can be readily done by each Element (and unfortunately, Text too)
storing related LayoutNodes. Which necessitates lifecycle management. Fun! But
still, it boils down to LayoutNode references, so it's easy enough.

```tsx
interface Element {
  _layoutNodes: LayoutNode[];
}
```
