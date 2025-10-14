export const SET_GLOBALS_EVENT_TYPE = 'setGlobals';

export type SetGlobalsEvent = CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}>;

export type DisplayMode = 'INLINE' | 'FULLSCREEN' | 'pip' | 'inline' | 'fullscreen';

export type CallToolResponse = {
  result: string;
};

export type OpenAiGlobals = {
  toolInput: unknown;
  toolOutput: unknown;
  conversationId: string;
  messageId: string;
  userId: string;
  displayMode: DisplayMode;
};

declare global {
  interface Window {
    openai?: Partial<OpenAiGlobals> & {
      sendFollowUpMessage?: (params: { prompt: string }) => Promise<void>;
      setDisplayMode?: (mode: DisplayMode) => void;
      callTool?: (name: string, args: Record<string, unknown>) => Promise<CallToolResponse>;
      requestDisplayMode?: (params: { mode: DisplayMode }) => Promise<{ mode: DisplayMode }>;
    };
  }
}
