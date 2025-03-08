export interface Attachment {
  file_name: string;
  file_type: string;
  extracted_content: string;
}

export interface Content {
  type: string;
  text: string;
  citations?: string[];
  start_timestamp?: string;
  stop_timestamp?: string;
}

export interface Message {
  uuid?: string;
  text: string;
  content: Content[];
  sender: string;
  threadId?: string;
  created_at: string;
  updated_at: string;
  attachments?: any[];
  files?: any[];
}

export interface Conversation {
  uuid: string;
  name?: string;
  chat_messages?: Message[];
  created_at?: string;
  updated_at?: string;
}

export interface Thread {
  id: string;
  title: string;
  user_edited_title: boolean;
  status: string;
  model: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}
