import { useOpenAiGlobal } from './use-openai-global';
import { useEffect } from 'react';

export function useToolOutput<T>(): T | null {
  const output = useOpenAiGlobal('toolOutput');

  useEffect(() => {
    console.log('Tool output is', output);
  }, [output]);

  // @ts-ignore - response object shape may vary
  return output?.result?.structuredContent ?? output;
}
