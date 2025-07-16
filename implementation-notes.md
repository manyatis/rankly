1. Keyword + Intent Analysis
They start with SEO-driven keyword research, but go beyond it by analyzing:
Searcher intent (navigational, informational, transactional)
How search engines like Google or answer engines (e.g., Perplexity, Bing AI, ChatGPT, Claude, etc.) handle those queries.
Tools they might use:

SEMrush / Ahrefs / Moz / SimilarWeb
Google Search Console
Custom scripts to scrape SERP features (like PAA boxes, featured snippets, etc.)
2. Web Search + SERP Feature Scraping
To emulate an answer engine, they:

Perform live searches using real engines (Google, Bing, Brave, Perplexity).
Scrape:
Featured Snippets
People Also Ask
Knowledge Graphs
Entity mentions
URLs and domains returned
Tech behind it:

APIs like SerpAPI or Zenserp
Custom Puppeteer or Playwright scripts to mimic browser behavior
3. AI Model Layer (LLM Analysis)
After gathering that live data, they send it to an LLM (like Claude, GPT-4, or proprietary models) with prompts like:

"Given the following results from answer engines, what entities (brands, people, products) are being highlighted? Which domains are ranked highly? What entities are likely considered authoritative?"
They can also simulate:

What a model like ChatGPT or Claude would answer today
Whether their brand/content is being surfaced
4. Entity Recognition + Schema Tracking
They track which named entities show up consistently across queries.

Tools/tech used:

OpenAI / Claude for summarization and entity extraction
Named Entity Recognition (NER) with spaCy or HuggingFace
Structured data analysis: checking for schema.org, FAQ, HowTo, and other markup
5. AEO Score or Ranking
Some AEO-focused companies provide a score or visibility map:

How often your content is referenced in answer boxes / snippets / LLM responses
Whether your structured data aligns with known entities
Entity frequency and positioning in AI-generated answers
They often benchmark you vs. competitors in terms of:

Entity prominence
Domain authority as interpreted by AI
Whether your content is used in answer generation
🤖 Can This Be Replicated Programmatically?

Yes — here’s how you'd build a simple version of what they do:

Use a search API (e.g., SerpAPI) to get real results for a keyword.
Extract data from the response — snippet text, URLs, PAA, etc.
Feed that into Claude or GPT-4 with prompts asking for:
Named entity recognition
Brand mentions
Analysis of trust, authority, etc.
Aggregate and visualize the data across multiple queries.

