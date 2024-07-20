import { Client } from "@notion_sdk";
import { BlockObjectResponse, ParagraphBlockObjectResponse, QueryDatabaseResponse, RichTextItemRequest } from "@notion_sdk/api-endpoints";
import type { NotionPage, NotionSearchResponse } from "./interfaces.ts";
import { Logger } from "./logger.ts";

Logger.info("Notion API Key: " + Deno.env.get("NOTION_API_KEY"));
const notion = new Client({ auth: Deno.env.get("NOTION_API_KEY") });

async function fetchAllPages(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  while (true) {
    const response: NotionSearchResponse = await notion.search({
      start_cursor: cursor ?? '',
      page_size: 100,
      filter: {
        value: "page",
        property: "object",
      },
    });

    pages.push(...response.results);

    if (!response.has_more) break;
    cursor = response.next_cursor;
  }

  return pages;
}

async function fetchPageContent<T extends BlockObjectResponse>(pageId: string): Promise<T[]> {
  const response = await notion.blocks.children.list({
    block_id: pageId,
  });

  return response.results as T[];
}

function parseAndUpdateVariables(pageContent: BlockObjectResponse[]): { [key: string]: string } {
  const variables: { [key: string]: string } = {};

  pageContent.forEach(block => {
    if (block.type === 'paragraph' && block.paragraph && block.paragraph.rich_text.length > 0) {
      const textContent = block.paragraph.rich_text[0].plain_text;
      const assignmentMatch = textContent.match(/\[(\w+)\s*=\s*'([^']+)'\]/);

      if (assignmentMatch) {
        const variable = assignmentMatch[1];
        const value = assignmentMatch[2];
        variables[variable] = value;
      }
    }
  });

  return variables;
}

async function updatePageContent(pageId: string, variables: { [key: string]: string }) {
  const pageContent = await fetchPageContent<ParagraphBlockObjectResponse>(pageId);

  const updatedContent = pageContent.map(block => {
    if (block.type === 'paragraph' && block.paragraph && block.paragraph.rich_text.length > 0) {
      let textContent = block.paragraph.rich_text[0].plain_text;

      Object.keys(variables).forEach(variable => {
        const placeholder = `[${variable}]`;
        if (textContent.includes(placeholder)) {
          textContent = textContent.replace(new RegExp(placeholder, 'g'), variables[variable]);
        }
      });

      const assignmentMatch = textContent.match(/\[(\w+)\s*=\s*'([^']+)'\]/);
      if (assignmentMatch) {
        const variable = assignmentMatch[1];
        const value = assignmentMatch[2];
        textContent = textContent.replace(`[${variable} = '${value}']`, '');
      }

      block.paragraph.rich_text[0].plain_text = textContent;
    }
    return block;
  });

  // Update the blocks with the new content
  for (const block of updatedContent) {
    if (!block.paragraph) continue;

    await notion.blocks.update({
      block_id: block.id,
      paragraph: {
        rich_text: block.paragraph.rich_text as RichTextItemRequest[],
        color: block.paragraph.color,
      },
    });
  }
}

async function updateWorkspaceContent() {
  const pages = await fetchAllPages();
  const allVariables: { [key: string]: string } = {};

  // First pass: collect all variable assignments
  for (const page of pages) {
    const pageContent = await fetchPageContent(page.id);
    const variables = parseAndUpdateVariables(pageContent);
    Object.assign(allVariables, variables);
  }

  // Second pass: update pages with variables
  for (const page of pages) {
    await updatePageContent(page.id, allVariables);
  }
}

let lastChecked = new Date(0).toISOString();

export async function createNotionDatabase() {
  const response = await notion.databases.create({
    parent: { page_id: "workspace" },
    title: [{ text: { content: "Workspace Content" } }],
    properties: {
      Name: {
        title: {},
      },
      Description: {
        rich_text: {},
      },
      LastEdited: {
        last_edited_time: {},
      },
    },
  });

  Logger.log(`Database created: ${response.id}`);
}

async function fetchNotionUpdates() {
  let response: QueryDatabaseResponse | null = null;
  try {
    response = await notion.databases.query({
      database_id: Deno.env.get("NOTION_DATABASE_ID") ?? "",
      filter: {
        property: "last_edited_time",
        date: {
          after: lastChecked,
        },
      },
    });
  } catch(dbQueryError) {
    Logger.error("Failed to fetch updates");
    throw dbQueryError;
  }

  if (!response) {
    Logger.error("No response from Notion API.");
    return;
  }

  const updatedPages = response?.results ?? [] as NotionPage[];

  if (updatedPages.length > 0) {
    Logger.log(`Updated Pages: ${updatedPages}`);
    lastChecked = new Date().toISOString();
  } else {
    Logger.log("No updates found.");
  }
}

export { updateWorkspaceContent, fetchNotionUpdates };