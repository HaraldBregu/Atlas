# Autocompleter Examples

Completes incomplete sentences or continues finished text with new sentences.

- If the input ends mid-sentence (no `.` `?` `!`), it completes the sentence.
- If the input ends with punctuation, it writes new follow-up sentences.

## Complete an unfinished sentence

```bash
npx tsx playground/autocompleter/index.ts --input "The quick brown fox"
npx tsx playground/autocompleter/index.ts --input "Once upon a time, in a land"
npx tsx playground/autocompleter/index.ts --input "The best way to learn programming is"
npx tsx playground/autocompleter/index.ts --input "She picked up the phone and"
```

## Continue from a finished sentence

```bash
npx tsx playground/autocompleter/index.ts --input "The sun set behind the mountains."
npx tsx playground/autocompleter/index.ts --input "Coffee originated in Ethiopia. It spread across the Arabian Peninsula."
npx tsx playground/autocompleter/index.ts --input "The experiment failed. No one knew why."
```

## Stream response

```bash
npx tsx playground/autocompleter/index.ts --stream --input "The ship had been drifting for"
npx tsx playground/autocompleter/index.ts --stream --input "It was a cold winter morning."
```

## Limit output tokens

```bash
npx tsx playground/autocompleter/index.ts --input "Coffee originated in" --max-tokens 30
npx tsx playground/autocompleter/index.ts --input "The city was quiet." --max-tokens 50
```

## Low temperature (predictable)

```bash
npx tsx playground/autocompleter/index.ts --input "The capital of France is" --temperature 0
npx tsx playground/autocompleter/index.ts --input "Water boils at" --temperature 0
```

## High temperature (creative)

```bash
npx tsx playground/autocompleter/index.ts --input "She opened the door and" --temperature 1
npx tsx playground/autocompleter/index.ts --input "The robot looked at the sky." --temperature 1
```
