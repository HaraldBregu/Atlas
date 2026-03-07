# Instruction-based LLM Examples

LLM call with input text and an instruction to transform or extend it.

Instructions can be passed inline with `--instruction` or loaded from a `.md` file with `--file`.

## Available instruction files

- `expand.md` — expand text into a full paragraph
- `rewrite-professional.md` — rewrite in professional tone
- `summarize.md` — summarize into one or two sentences
- `continue.md` — continue writing from where the text ends
- `simplify.md` — simplify to everyday language
- `fix-grammar.md` — fix grammar, spelling, and punctuation

## Using instruction files

```bash
npx tsx playground/instructions/index.ts --input "Coffee originated in Ethiopia." --file expand
npx tsx playground/instructions/index.ts --input "The meeting went okay I guess." --file rewrite-professional
npx tsx playground/instructions/index.ts --input "The ship had been drifting for three days." --file summarize
npx tsx playground/instructions/index.ts --input "The ship had been drifting for three days." --file continue
npx tsx playground/instructions/index.ts --input "AI is very complecated and hard to undrestand." --file fix-grammar
npx tsx playground/instructions/index.ts --input "Quantum entanglement is a phenomenon whereby two particles become interconnected." --file simplify
```

## Inline instruction

```bash
npx tsx playground/instructions/index.ts --input "Coffee originated in Ethiopia." --instruction "expand this into a full paragraph"
```

## Stream response

```bash
npx tsx playground/instructions/index.ts --stream --input "Coffee originated in Ethiopia." --file expand
```

## Limit output tokens

```bash
npx tsx playground/instructions/index.ts --input "Coffee originated in Ethiopia." --file expand --max-tokens 100
```
