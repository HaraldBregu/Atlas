# Examples

## Quick Start

Make sure you have an `OPENAI_API_KEY` in your `.env` file, then:

```bash
yarn marker-writer
```

This runs all three intent examples (continue, expand, rewrite).

## CLI Usage

```bash
yarn marker-writer:cli --text "<your text>" [--instruction "<instruction>"]
```

## Intent Examples

### Continue — "keep writing"

No instruction or instructions like "keep writing", "continue the story", "write the next paragraph":

```bash
# Default (no instruction = continue)
yarn marker-writer:cli \
  --text "The village sat at the edge of a vast forest that no one dared enter after dark."

# Explicit continue
yarn marker-writer:cli \
  --text "The village sat at the edge of a vast forest that no one dared enter after dark." \
  --instruction "keep writing"
```

### Expand — "make this paragraph longer"

Instructions like "make this longer", "add more detail", "elaborate on this":

```bash
yarn marker-writer:cli \
  --text "Coffee originated in Ethiopia. A herder noticed his goats became energetic after eating certain berries. The practice of brewing the beans spread across the Arabian Peninsula." \
  --instruction "make this paragraph longer"
```

### Rewrite — "rewrite this to sound more professional"

Instructions like "rewrite this", "make it more professional", "change the tone":

```bash
yarn marker-writer:cli \
  --text "So basically AI is like super cool and it's changing everything. Companies are using it for all sorts of stuff and it's gonna be huge in the future." \
  --instruction "rewrite this section to sound more professional"
```

## Graph Architecture

```
__start__ → analyzer → generator → __end__
```

| Node        | Role                                                            |
| ----------- | --------------------------------------------------------------- |
| `analyzer`  | Classifies intent (continue/expand/rewrite) + extracts style    |
| `generator` | Builds prompt from intent + style, calls LLM, assembles output  |
