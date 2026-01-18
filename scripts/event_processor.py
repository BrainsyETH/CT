#!/usr/bin/env python3
"""
Private Event Processor Script for chainofevents.xyz

This script processes links and generates event JSON entries for the events.json dataset.
KEEP THIS SCRIPT PRIVATE - Do not commit to public repositories.

Usage:
    1. Copy .env.example to .env and add your OPENAI_API_KEY
    2. pip install -r scripts/requirements.txt
    3. python scripts/event_processor.py
"""

import os
import sys
import json
import time
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EVENTS_JSON_PATH = Path(__file__).parent.parent / "src" / "data" / "events.json"

# Request configuration
REQUEST_TIMEOUT = 15
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Valid controlled vocabularies (update these based on your actual dataset)
VALID_MODES = ["timeline", "crimeline"]
VALID_TAGS = [
    "TECH", "MILESTONE", "CULTURAL", "LEGAL", "REGULATORY", "HACK", "SCAM",
    "FRAUD", "ARREST", "LAWSUIT", "EXCHANGE", "DEFI", "NFT", "DAO", "FORK",
    "MARKET", "INSTITUTIONAL", "GOVERNMENT", "SECURITY", "PROTOCOL"
]
VALID_CATEGORIES = [
    "Bitcoin", "Ethereum", "Exchange", "DeFi", "NFT", "Regulation", "Legal",
    "Hack", "Scam", "Protocol", "Infrastructure", "Government", "Institutional"
]

# The Event Prompt - Hardcoded so you never have to retype it
EVENT_PROMPT = """
You are adding new entries to my events.json dataset.

HARD RULES:
- Output MUST be valid JSON: an array of event objects (even if only 1 event).
- Do NOT include commentary, markdown, or extra keys.
- Use only the existing controlled vocabularies provided.
- Never duplicate an existing event id.
- Prefer primary sources: X/Twitter links.

EVENT SCHEMA:
Each event object must have this exact structure:
{
    "id": "short-kebab-case-name-YYYY-MM-DD",
    "date": "YYYY-MM-DD",
    "title": "Event Title",
    "summary": "Detailed description of the event...",
    "category": ["Category1"],
    "tags": ["TAG1", "TAG2"],
    "mode": ["timeline"],
    "image": "",
    "media": [
        {
            "type": "video",
            "video": {"provider": "", "url": "", "embed_url": "", "poster_url": ""}
        },
        {
            "type": "twitter",
            "twitter": {"tweet_url": "", "account_handle": ""}
        },
        {
            "type": "image",
            "image": {"url": "", "alt": "", "caption": ""}
        }
    ],
    "links": [
        {"label": "Source Name", "url": "https://..."}
    ],
    "metrics": {
        "btc_price_usd": 0
    }
}

VALID MODES: timeline, crimeline
VALID TAGS: TECH, MILESTONE, CULTURAL, LEGAL, REGULATORY, HACK, SCAM, FRAUD, ARREST, LAWSUIT, EXCHANGE, DEFI, NFT, DAO, FORK, MARKET, INSTITUTIONAL, GOVERNMENT, SECURITY, PROTOCOL
VALID CATEGORIES: Bitcoin, Ethereum, Exchange, DeFi, NFT, Regulation, Legal, Hack, Scam, Protocol, Infrastructure, Government, Institutional

ID FORMAT: Use kebab-case with the date suffix, e.g., "ftx-collapse-2022-11-11"

For the summary field:
- Write 2-4 sentences with key facts
- Include specific numbers, dates, and names when available
- Keep it objective and factual

For media fields:
- If a Twitter/X link is provided, populate the twitter object
- Leave empty strings for unavailable media

Return ONLY the JSON array, no other text.
"""


def validate_api_key() -> bool:
    """Validate that the OpenAI API key is configured."""
    if not OPENAI_API_KEY:
        print("\n[ERROR] OPENAI_API_KEY not found!")
        print("Please set it in your .env file:")
        print("  1. Copy .env.example to .env")
        print("  2. Add: OPENAI_API_KEY=sk-your-key-here")
        return False
    if not OPENAI_API_KEY.startswith(("sk-", "sk-proj-")):
        print("\n[WARNING] API key format looks unusual. Proceeding anyway...")
    return True


def get_url_content(url: str) -> str:
    """
    Scrape text content from a URL with retry logic.

    Note: Standard scrapers struggle with X/Twitter. For X links,
    consider using Firecrawl or similar service.
    """
    headers = {"User-Agent": USER_AGENT}

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove script, style, and other non-content elements
            for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
                element.decompose()

            # Get text and clean it up
            text = soup.get_text(separator=' ', strip=True)

            # Basic cleanup
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            cleaned_text = ' '.join(lines)

            return cleaned_text

        except requests.exceptions.Timeout:
            print(f"  [Timeout] Attempt {attempt + 1}/{MAX_RETRIES}...")
        except requests.exceptions.RequestException as e:
            print(f"  [Error] Attempt {attempt + 1}/{MAX_RETRIES}: {e}")

        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY * (attempt + 1))  # Exponential backoff

    return f"[Failed to scrape after {MAX_RETRIES} attempts]"


def validate_mode(mode_input: str) -> list:
    """Validate and return mode as a list."""
    mode = mode_input.strip().lower()
    if mode not in VALID_MODES:
        print(f"  [WARNING] '{mode}' is not a valid mode. Valid options: {VALID_MODES}")
        while True:
            mode = input(f"  Please enter a valid mode ({'/'.join(VALID_MODES)}): ").strip().lower()
            if mode in VALID_MODES:
                break
    return [mode]


def parse_comma_list(input_str: str) -> list:
    """Parse a comma-separated string into a cleaned list."""
    return [item.strip() for item in input_str.split(',') if item.strip()]


def get_existing_ids() -> set:
    """Load existing event IDs to prevent duplicates."""
    if not EVENTS_JSON_PATH.exists():
        return set()

    try:
        with open(EVENTS_JSON_PATH, 'r', encoding='utf-8') as f:
            events = json.load(f)
            return {event.get('id', '') for event in events}
    except (json.JSONDecodeError, IOError) as e:
        print(f"  [WARNING] Could not read existing events: {e}")
        return set()


def process_link(url: str, client: OpenAI) -> Optional[str]:
    """Process a single link and generate event JSON."""
    print(f"\n--- Processing: {url} ---")

    # Check if this might be a Twitter/X link
    if 'twitter.com' in url or 'x.com' in url:
        print("  [NOTE] X/Twitter links may not scrape well. Consider using Firecrawl.")

    # Step 1: Get the data from the link
    print("  Fetching content...")
    raw_content = get_url_content(url)

    if raw_content.startswith("[Failed"):
        print(f"  {raw_content}")
        proceed = input("  Continue without scraped content? (y/n): ").strip().lower()
        if proceed != 'y':
            return None
        raw_content = "[Content could not be scraped - please provide details manually]"
    else:
        print(f"  Scraped {len(raw_content)} characters")

    # Step 2: Get existing IDs to prevent duplicates
    existing_ids = get_existing_ids()

    # Step 3: Ask the user for the mandatory clarifying details
    print("\nPlease provide the following details to ensure accuracy:")

    event_name_date = input("1) Exact event name + date (e.g., FTX Collapse 2022-11-11): ").strip()
    if not event_name_date:
        print("  [ERROR] Event name/date is required.")
        return None

    mode_input = input("2) Mode (timeline/crimeline): ").strip()
    mode = validate_mode(mode_input)

    categories_input = input("3) Categories (comma-separated): ").strip()
    categories = parse_comma_list(categories_input)
    if not categories:
        print("  [WARNING] No categories provided. Using 'General'")
        categories = ["General"]

    tags_input = input("4) Tags (comma-separated, e.g., HACK, LEGAL): ").strip().upper()
    tags = parse_comma_list(tags_input)

    # Optional: Get additional context
    additional_context = input("5) Any additional context? (press Enter to skip): ").strip()

    # Build the context for the AI
    user_context = f"""
EVENT NAME/DATE: {event_name_date}
MODE: {mode[0]}
CATEGORIES: {', '.join(categories)}
TAGS: {', '.join(tags)}
SOURCE URL: {url}
EXISTING EVENT IDS (do not duplicate): {', '.join(list(existing_ids)[:50])}...

SOURCE CONTENT:
{raw_content[:6000]}

{f'ADDITIONAL CONTEXT: {additional_context}' if additional_context else ''}

Generate the event JSON entry following the schema exactly.
"""

    # Step 4: Run through OpenAI
    print("\n  Generating event JSON via OpenAI...")

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": EVENT_PROMPT},
                {"role": "user", "content": user_context}
            ],
            response_format={"type": "json_object"},
            temperature=0.3  # Lower temperature for more consistent output
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"\n  [ERROR] OpenAI API error: {e}")
        return None


def save_to_events_json(json_output: str) -> bool:
    """
    Save generated events to the events.json file.

    Handles both single objects and arrays correctly.
    Uses write mode to avoid truncation issues.
    """
    try:
        new_entries = json.loads(json_output)

        # Handle the case where the response wraps entries in an object
        if isinstance(new_entries, dict):
            if 'events' in new_entries:
                new_entries = new_entries['events']
            else:
                # Single event wrapped in object with event properties
                new_entries = [new_entries]

        # Ensure it's a list
        if not isinstance(new_entries, list):
            new_entries = [new_entries]

        # Load existing data
        if EVENTS_JSON_PATH.exists():
            with open(EVENTS_JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = []

        # Check for duplicate IDs
        existing_ids = {event.get('id') for event in data}
        for entry in new_entries:
            if entry.get('id') in existing_ids:
                print(f"  [WARNING] Duplicate ID detected: {entry.get('id')}")
                new_id = input(f"  Enter a new ID (or press Enter to skip this entry): ").strip()
                if new_id:
                    entry['id'] = new_id
                else:
                    new_entries.remove(entry)
                    continue

        # Extend (not append) to handle arrays correctly
        data.extend(new_entries)

        # Write back using 'w' mode (cleaner than r+ with seek/truncate)
        with open(EVENTS_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"  Successfully saved {len(new_entries)} event(s) to {EVENTS_JSON_PATH}")
        return True

    except json.JSONDecodeError as e:
        print(f"  [ERROR] Invalid JSON in response: {e}")
        return False
    except IOError as e:
        print(f"  [ERROR] Could not write to file: {e}")
        return False


def preview_json(json_output: str) -> None:
    """Pretty print the JSON output for review."""
    try:
        parsed = json.loads(json_output)
        print("\n" + "=" * 60)
        print("GENERATED JSON PREVIEW:")
        print("=" * 60)
        print(json.dumps(parsed, indent=2, ensure_ascii=False))
        print("=" * 60)
    except json.JSONDecodeError:
        print("\n[Raw output - not valid JSON]:")
        print(json_output)


def main():
    """Main entry point for the event processor."""
    print("\n" + "=" * 60)
    print("  Chain of Events - Private Link Processor")
    print("=" * 60)

    # Validate API key
    if not validate_api_key():
        sys.exit(1)

    # Initialize OpenAI client
    client = OpenAI(api_key=OPENAI_API_KEY)

    print(f"\nEvents file: {EVENTS_JSON_PATH}")
    print("Type 'exit' or 'quit' to stop.\n")

    while True:
        try:
            target_link = input("\nEnter the link to process: ").strip()

            if target_link.lower() in ('exit', 'quit', 'q'):
                print("\nGoodbye!")
                break

            if not target_link:
                print("  Please enter a valid URL.")
                continue

            if not target_link.startswith(('http://', 'https://')):
                print("  [WARNING] URL should start with http:// or https://")
                target_link = 'https://' + target_link
                print(f"  Using: {target_link}")

            json_output = process_link(target_link, client)

            if json_output:
                preview_json(json_output)

                save = input("\nSave to events.json? (y/n): ").strip().lower()
                if save == 'y':
                    save_to_events_json(json_output)
                else:
                    # Option to copy to clipboard or save to temp file
                    copy = input("Copy JSON to a temp file? (y/n): ").strip().lower()
                    if copy == 'y':
                        temp_path = Path(__file__).parent / "temp_event.json"
                        with open(temp_path, 'w', encoding='utf-8') as f:
                            f.write(json_output)
                        print(f"  Saved to: {temp_path}")

        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n[Unexpected error]: {e}")
            continue


if __name__ == "__main__":
    main()
