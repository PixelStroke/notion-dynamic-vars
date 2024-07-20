import { RichTextItemRequest, ApiColor } from "denoland/notion_sdk/api-endpoints";

export interface NotionPage {
  object: string;
  id: string;
}

export interface NotionSearchResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export interface NotionBlock {
  id: string;
  type: string;
  paragraph?: {
    text: {
      text: {
        content: string;
      };
    }[];
  };
}

export interface UpdatedBlock {
  id: string;
  paragraph?: {
    rich_text: RichTextItemRequest[];
    color?: ApiColor;
  };
}
