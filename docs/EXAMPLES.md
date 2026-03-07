# Examples

## Quick Start

Make sure you have an `OPENAI_API_KEY` in your `.env` file.

```bash
yarn writer --input "The village sat at the edge of a vast forest that no one dared enter after dark."
```

## Usage

### Continue from text

```bash
yarn writer --input "The ship had been drifting for three days. Supplies were low, and the crew had stopped speaking to one another."
```

### With instruction

```bash
yarn writer --input "Coffee originated in Ethiopia." --instruction "keep writing"
```

### Read from file

```bash
yarn writer --file input.txt
```

## Graph Architecture

```
__start__ → writer → __end__
```

| Node     | Role                                      |
| -------- | ----------------------------------------- |
| `writer` | Takes input text, calls LLM, returns text |
