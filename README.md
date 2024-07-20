# NotionDynamicVars

NotionDynamicVars is a tool to manage and dynamically update variables within Notion pages across the entire workspace. This allows you to define, manipulate, and reference variables directly within your Notion pages.

## Features
- Define variables using `[VARIABLE_NAME = 'Value']` syntax.
- Reference variables using `[VARIABLE_NAME]` syntax.
- Automatically updates references when variable values are changed across the entire workspace.

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/NotionDynamicVars.git
   cd NotionDynamicVars


### Running the Project

1. **Set Up Environment Variables:**
   - Create a `.env` file with your Notion API key:
     ```plaintext
     NOTION_API_KEY=your_notion_api_key
     ```

2. **Run the Script:**
   ```sh
   deno run --allow-net --allow-read src/mod.ts
