# Examples

## Quick Start

Make sure you have an `OPENAI_API_KEY` in your `.env` file.

### Main graph

```bash
npx tsx src/index.ts --input "The village sat at the edge of a vast forest that no one dared enter after dark."
```

### Marker writer graph

```bash
yarn marker-writer
```

## Graph Architecture

### Main graph (`src/graph.ts`)

```
__start__ → writer → __end__
```

Takes `inputText`, generates a continuation.

### Marker writer graph (`src/marker_writer/graph.ts`)

```
__start__ → writer → __end__
```

Takes `inputText` + optional `instruction`, generates text.

## Usage

### Continue from text

```bash
npx tsx src/index.ts --input "The ship had been drifting for three days. Supplies were low, and the crew had stopped speaking to one another."
```

### Read from file

```bash
npx tsx src/index.ts --file input.txt
```
