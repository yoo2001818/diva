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
