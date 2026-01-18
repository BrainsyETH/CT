# Private Scripts

These scripts are for internal use in managing the chainofevents.xyz dataset.

## Event Processor

Processes links and generates JSON entries for `events.json`.

### Setup

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   pip install -r scripts/requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key
   ```

### Usage

```bash
python scripts/event_processor.py
```

The script will:
1. Prompt you for a link to process
2. Scrape content from the link
3. Ask clarifying questions (event name, date, mode, categories, tags)
4. Generate structured JSON via OpenAI
5. Optionally save to `src/data/events.json`

### Notes

- **Twitter/X links**: Standard scraping doesn't work well. Consider using [Firecrawl](https://firecrawl.dev/) or similar.
- **Privacy**: The `.env` file is gitignored. Never commit API keys.
- **To keep scripts private**: Uncomment `/scripts/` in `.gitignore`
