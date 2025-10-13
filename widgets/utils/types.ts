export type UnknownObject = Record<string, unknown>;

export type DisplayMode = 'inline' | 'pip' | 'fullscreen';

export type OpenAiGlobals<
  ToolInput = UnknownObject,
  ToolOutput = UnknownObject,
  ToolResponseMetadata = UnknownObject,
  WidgetState = UnknownObject
> = {
  theme?: 'light' | 'dark';
  locale?: string;
  maxHeight?: number;
  displayMode?: DisplayMode;
  toolInput?: ToolInput;
  toolOutput?: ToolOutput | null;
  toolResponseMetadata?: ToolResponseMetadata | null;
  widgetState?: WidgetState | null;
  setWidgetState?: (state: WidgetState) => Promise<void>;
  callTool?: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<{ result: string }>;
  sendFollowUpMessage?: (payload: { prompt: string }) => Promise<void>;
};

export const SET_GLOBALS_EVENT_TYPE = 'openai:set_globals';

export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE;
}

declare global {
  interface Window {
    openai?: OpenAiGlobals;
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}