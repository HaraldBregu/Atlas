# Examples

## Quick Start

Make sure you have an `OPENAI_API_KEY` in your `.env` file.

### Main graph (src/graph.ts)

```bash
# Continue a text
npx tsx src/index.ts --input "The village sat at the edge of a vast forest that no one dared enter after dark."

# Read from file
npx tsx src/index.ts --file input.txt

# Interactive mode
npx tsx src/index.ts --interactive
```

### Marker writer graph (src/marker_writer/graph.ts)

```bash
yarn marker-writer
```

## Graph Architecture

### Main graph

```
__start__ → writer → __end__
```

Takes `inputText`, generates a continuation.

### Marker writer graph

```
__start__ → writer → __end__
```

Takes `inputText` + optional `instruction`, generates text.

## Usage Examples

### Continue a story

```bash
npx tsx src/index.ts --input "The ship had been drifting for three days. Supplies were low, and the crew had stopped speaking to one another."
```

### Continue with instruction

```bash
yarn marker-writer:cli --text "Artificial intelligence has transformed every industry." --instruction "keep writing"
```

### Generate from scratch

```bash
yarn marker-writer:cli --text "" --instruction "write a short paragraph about the moon"
```
