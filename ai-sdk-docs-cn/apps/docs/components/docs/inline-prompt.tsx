'use client';

import { useEffect, useId, useRef, useState } from 'react';

const getMockResponses = (input: string) => {
  if (input.toLowerCase().includes('coffee')) {
    return [
      '为美好时光而冲煮。',
      '每一杯，都有自己的节奏。',
      '有机豆子，非凡能量。',
    ];
  }
  if (input.toLowerCase().includes('harry potter')) {
    return [
      '女贞路四号的德思礼夫妇总是得意地说他们是非常规矩的人家。',
    ];
  }
  return [
    '让人记住的想法都很具体、表达直白，并给人们一个在意的理由。',
  ];
};

export const InlinePrompt = ({
  initialInput,
  initialTemperature = 0,
  showTemp = false,
  blocking = false,
}: {
  initialInput: string;
  initialTemperature?: number;
  showTemp?: boolean;
  blocking?: boolean;
  skipCache?: boolean;
}) => {
  const [input, setInput] = useState(initialInput);
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(initialTemperature);
  const cleanupRef = useRef<(() => void) | null>(null);
  const responseIndexRef = useRef(0);
  const inputId = useId();

  useEffect(() => () => cleanupRef.current?.(), []);

  const generate = () => {
    cleanupRef.current?.();
    setCompletion('');
    setIsLoading(true);
    const responses = getMockResponses(input);
    const response =
      responses[
        temperature > 0 ? responseIndexRef.current % responses.length : 0
      ];
    responseIndexRef.current += 1;

    if (blocking) {
      const timeout = setTimeout(() => {
        setCompletion(response);
        setIsLoading(false);
      }, 700);
      cleanupRef.current = () => clearTimeout(timeout);
      return;
    }

    const words = response.split(' ');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setCompletion(words.slice(0, index).join(' '));
      if (index === words.length) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 45);
    cleanupRef.current = () => clearInterval(interval);
  };

  return (
    <form
      className="not-prose my-4 overflow-hidden rounded-lg border border-gray-alpha-400"
      onSubmit={event => {
        event.preventDefault();
        generate();
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        Prompt
      </label>
      <div className="flex items-start gap-2 p-3">
        <textarea
          className="min-h-20 flex-1 resize-y rounded-md border border-gray-alpha-400 bg-background-100 p-3 text-gray-1000 text-sm leading-5 focus-visible:ring-2 focus-visible:ring-blue-700"
          id={inputId}
          name="prompt"
          onChange={event => setInput(event.target.value)}
          spellCheck={false}
          value={input}
        />
        <button
          className="rounded-md bg-gray-1000 px-3 py-2 font-medium text-background-100 text-sm hover:bg-gray-900 focus-visible:ring-2 focus-visible:ring-blue-700"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? '生成中…' : '生成'}
        </button>
      </div>
      {showTemp ? (
        <label className="flex items-center gap-3 border-gray-alpha-400 border-t px-4 py-3 text-gray-900 text-sm">
          温度
          <input
            className="flex-1 accent-blue-700"
            max="1"
            min="0"
            onChange={event => setTemperature(Number(event.target.value))}
            step="0.1"
            type="range"
            value={temperature}
          />
          <span className="w-6 text-right font-mono tabular-nums">
            {temperature.toFixed(1)}
          </span>
        </label>
      ) : null}
      <div
        aria-live="polite"
        className="min-h-20 border-gray-alpha-400 border-t bg-gray-100 p-4 text-gray-900 text-sm leading-6"
      >
        {completion || '生成的响应会显示在这里。'}
      </div>
    </form>
  );
};
