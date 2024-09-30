# https://www.w3.org/TR/selectors-4/
@builtin "whitespace.ne"
@{% 
function join(d) {
  return d.join('');
}
%}

selector_list -> _ complex_selector_list _ {% d => d[1] %}
complex_selector_list -> complex_selector (_ "," _ complex_selector):* {% d => [d[0], ...d[1].map((v) => v[3])] %}
compound_selector_list -> compound_selector (_ "," _ complex_selector):*
simple_selector_list -> simple_selector (_ "," _ simple_selector):*
relative_selector_list -> relative_selector (_ "," _ relative_selector):*

complex_selector -> compound_selector (_ combinator _ compound_selector):* {% d => ({
  type: 'complexSelector',
  children: [d[0], ...d[1].flatMap((v) => ([v[1], v[3]]))],
}) %}
relative_selector -> combinator:? _ complex_selector

compound_selector -> complex_selector_value {% d => ({
  type: 'compoundSelector',
  children: d[0],
}) %}

complex_selector_value -> 
  type_selector subclass_selector:* (pseudo_element_selector pseudo_class_selector:*):* {% d => [d[0], ...d[1], ...d[2].flatMap((v) => [v[0], ...v[1]])] %} |
  subclass_selector:+ (pseudo_element_selector pseudo_class_selector:*):* {% d => [...d[0], ...d[1].flatMap((v) => [v[0], ...v[1]])] %} |
  (pseudo_element_selector pseudo_class_selector:*):+ {% d => d[0].flatMap((v) => [v[0], ...v[1]]) %}

simple_selector -> type_selector {% id %} | subclass_selector {% id %}

combinator -> combinator_type {% d => ({ type: 'combinator', name: d[0] }) %}

combinator_type ->
  ">" {% id %} |
  "+" {% id %} |
  "~" {% id %} |
  "||" {% id %} |
  [\s] {% () => " " %}

type_selector ->
  wq_name {% d => ({ type: 'typeSelector', name: d[0] }) %} |
  ns_prefix:? "*" {% d => ({ type: 'typeSelector', name: join(d) }) %}

ns_prefix -> (ident_token | "*"):? "|" {% join %}

wq_name -> ns_prefix:? ident_token {% join %}

subclass_selector ->
  id_selector {% id %} |
  class_selector {% id %} |
  attribute_selector {% id %} |
  pseudo_class_selector {% id %}

id_selector -> hash_token {% d => ({ type: 'idSelector', name: d[0] }) %}

class_selector -> "." ident_token {% d => ({ type: 'classSelector', name: d[1] }) %}

attribute_selector ->
  "[" wq_name "]" {% d => ({ type: 'attributeSelector', name: d[1] }) %} |
  "[" wq_name attr_matcher string_or_ident attr_modifier:? "]" {% d => ({ type: 'attributeSelector', name: d[1], matcher: d[2], value: d[3], modifier: d[4] }) %}
attr_matcher -> ( "~" | "|" | "^" | "$" | "*" ):? "=" {% join %}
attr_modifier -> "i" {% id %} | "s" {% id %}

string_or_ident -> string_token {% id %} | ident_token {% id %}

pseudo_class_selector ->
  ":" ident_token {% d => ({ type: 'pseudoSelector', name: d[1] }) %} |
  ":" function_token [^)]:+ ")" {% d => ({ type: 'pseudoSelector', name: d[1] + '(' + d[2].join('') + d[3] }) %}

pseudo_element_selector -> ":" pseudo_class_selector {% id %}

function_token -> ident_token "(" {% id %}

at_keyword_token -> "@" ident_token

string_token -> "\"" ([^"\\\n] | escape | "\\\n"):* "\"" {% d => d[1].join('') %} | "'" ([^'\\\n] | escape | "\\\n"):* "'" {% d => d[1].join('') %}

url_token -> "url(" _ ([^"'()\\\s] | escape):* _ ")"

number_token -> ("+" | "-"):? (digit:* "." digit:+ | digit:+) ([eE] ("+" | "-"):? digit:+):?

ident_token -> ("--" | "-":? char {% d => (d[0] || '') + d[1] %}) char:* {% d => d[0] + d[1].join('') %}

hash_token -> "#" char:+ {% d => d[1].join('') %}

char -> [a-zA-Z0-9_-] {% id %} | [^\x00-\x7F] {% id %} | escape {% id %}

escape -> "\\" [^0-9a-fA-F\n] {% id %} | "\\" hex_digit hex_digit:? hex_digit:? hex_digit:? hex_digit:? hex_digit:? _ {% d => d.slice(1).join('') %}

hex_digit -> [0-9a-fA-F] {% id %}

digit -> [0-9] {% id %}
