export const SET_GLOBALS_EVENT_TYPE = 'setGlobals';

export type SetGlobalsEvent = CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}>;

export type DisplayMode = 'INLINE' | 'FULLSCREEN';

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
      sendFollowUpMessage?: (params: { prompt: string }) => void;
      setDisplayMode?: (mode: DisplayMode) => void;
    };
  }
}
