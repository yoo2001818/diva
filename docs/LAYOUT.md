# Layout

## Box interaction

Each element spawns a single box, or several boxes. The boxes are independent
from the HTML tree.

Pseudo elements are treated as an element - it is not considered as a box, but
just a regular HTML element for CSS layout code.

Each box has "outward" dimensions and "inward" dimensions, where outward
dimensions are used to place the node on the outside, and inware dimensions are
used to place children inside, including scroll bars. Both normally do not
interact with each other; The node itself can control the outward dimensions
by specifying width/height.

The box can operate in two modes (formatting context), "block" and "inline"
modes. In many cases, each element has a required formatting context, and
an anonymous box will be created if the parent do not satisfy the required mode.

In a sense, the box tree is vaguely similar to the HTML element tree, but
they're not equal. The box tree can be described within HTML tree though, using
shadow trees and whatnot.

### Outward placement

The outward placement determines what the parent node or the user "sees".
Precisely, it determines the bounding box relative to the parent (or offset
parent, if absolute), and the parent's layout logic operates with this.

The inner content of the element can exceed this bounding box, which in case
it will remain visible, hidden, or scrollable depending on the overflow style.

### Inward placement

Unlike outward placement, inward placement doesn't have means to specify the
size by the node itself. While it will be equal to larger than the outward
bounding box, there are no means to specify it with the element alone. Instead,
child elements must extend the box by being larger than the parent element.
