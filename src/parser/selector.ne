# https://www.w3.org/TR/selectors-4/
@builtin "whitespace.ne"

selector_list -> _ complex_selector_list _
complex_selector_list -> complex_selector (_ "," _ complex_selector):*
compound_selector_list -> compound_selector (_ "," _ complex_selector):*
simple_selector_list -> simple_selector (_ "," _ simple_selector):*
relative_selector_list -> relative_selector (_ "," _ relative_selector):*

complex_selector -> compound_selector (_ combinator _ compound_selector):*
relative_selector -> combinator:? _ complex_selector

compound_selector ->
  type_selector subclass_selector:* (pseudo_element_selector pseudo_class_selector:*):* |
  subclass_selector:+ (pseudo_element_selector pseudo_class_selector:*):* |
  (pseudo_element_selector pseudo_class_selector:*):+

simple_selector -> type_selector | subclass_selector

combinator -> ">" | "+" | "~" | "||" | [\s]

type_selector -> wq_name | ns_prefix:? "*"

ns_prefix -> (ident_token | "*"):? "|"

wq_name -> ns_prefix:? ident_token

subclass_selector -> id_selector | class_selector | attribute_selector | pseudo_class_selector

id_selector -> hash_token

class_selector -> "." ident_token

attribute_selector -> "[" wq_name "]" | "[" wq_name attr_matcher string_or_ident attr_modifier:? "]"
attr_matcher -> ( "~" | "|" | "^" | "$" | "*" ):? "="
attr_modifier -> "i" | "s"

string_or_ident -> string_token | ident_token

pseudo_class_selector -> ":" ident_token | ":" function_token [^)]:+ ")"

pseudo_element_selector -> ":" pseudo_class_selector

function_token -> ident_token "("

at_keyword_token -> "@" ident_token

string_token -> "\"" ([^"\\\n] | escape | "\\\n"):* "\"" {% d => d[1].join('') %} | "'" ([^'\\\n] | escape | "\\\n"):* "'" {% d => d[1].join('') %}

url_token -> "url(" _ ([^"'()\\\s] | escape):* _ ")"

number_token -> ("+" | "-"):? (digit:* "." digit:+ | digit:+) ([eE] ("+" | "-"):? digit:+):?

ident_token -> ("--" | "-":? char {% d => (d[0] || '') + d[1] %}) char:* {% d => d[0] + d[1].join('') %}

hash_token -> "#" char:+ {% d => d[1].join('') %}

char -> [a-zA-Z0-9_-] {% id %} | [^\x00-\x7F] {% id %} | escape {% id %}

escape -> "\\" [^0-9a-fA-F\n] {% id %} | "\\" hex_digit hex_digit:? hex_digit:? hex_digit:? hex_digit:? hex_digit:? _ {% d => d.slice(1).join('') %}

hex_digit -> [0-9a-fA-F] {% id %}

digit -> [0-9]
