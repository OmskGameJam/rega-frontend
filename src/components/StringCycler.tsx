import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StringCyclerProps {
  strings: string[];
  displayDuration?: number;
  transformationInterval?: number;
  lengthAdjustmentInterval?: number;
  className?: string;
}

interface StringTransformer {
  current: string;
  goal: string;
  interval: number;
  lengthAdjustmentInterval: number;
  intervalId?: number;
  lengthIntervalId?: number;
  onProgress?: (current: string) => void;
  onComplete?: () => void;
}

const StringCycler: React.FC<StringCyclerProps> = ({
  strings,
  displayDuration = 3000,
  transformationInterval = 10,
  lengthAdjustmentInterval = 50,
  className = ''
}) => {
  const [currentString, setCurrentString] = useState(strings[0] || '');
  const [isTransforming, setIsTransforming] = useState(false);
  const currentIndexRef = useRef(0);
  const transformerRef = useRef<StringTransformer | null>(null);
  const displayTimeoutRef = useRef<number>();

  const getRandomChar = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const transformCharacter = (currentChar: string, goalChar: string): string => {
    if (currentChar === goalChar) return currentChar;

    const currentCode = currentChar.charCodeAt(0);
    const goalCode = goalChar.charCodeAt(0);

    if (currentCode < goalCode) {
      return String.fromCharCode(currentCode + 1);
    } else {
      return String.fromCharCode(currentCode - 1);
    }
  };

  const startTransformation = useCallback((from: string, to: string) => {
    // Clean up any existing transformer
    if (transformerRef.current?.intervalId) {
      clearInterval(transformerRef.current.intervalId);
    }
    if (transformerRef.current?.lengthIntervalId) {
      clearInterval(transformerRef.current.lengthIntervalId);
    }

    setIsTransforming(true);
    let current = from;

    const transformer: StringTransformer = {
      current: from,
      goal: to,
      interval: transformationInterval,
      lengthAdjustmentInterval: lengthAdjustmentInterval,
      onProgress: (newCurrent: string) => {
        setCurrentString(newCurrent);
        current = newCurrent;
      },
      onComplete: () => {
        setIsTransforming(false);
        transformer.intervalId = undefined;
        transformer.lengthIntervalId = undefined;
        
        // Start the display timer only when transformation is complete
        displayTimeoutRef.current = setTimeout(() => {
          const nextIndex = (currentIndexRef.current + 1) % strings.length;
          const nextString = strings[nextIndex];
          currentIndexRef.current = nextIndex;
          startTransformation(to, nextString);
        }, displayDuration);
      }
    };

    // Separate interval for length adjustments
    const lengthStep = () => {
      if (current.length < to.length) {
        // Add characters when current is shorter
        current += getRandomChar();
        setCurrentString(current);
      } else if (current.length > to.length) {
        // Remove characters when current is longer
        const removeIndex = Math.floor(Math.random() * current.length);
        current = current.slice(0, removeIndex) + current.slice(removeIndex + 1);
        setCurrentString(current);
      }
      
      // Stop length adjustments when lengths match
      if (current.length === to.length && transformer.lengthIntervalId) {
        clearInterval(transformer.lengthIntervalId);
        transformer.lengthIntervalId = undefined;
      }
    };

    // Main interval for character transformations - runs simultaneously with length adjustments
    const transformationStep = () => {
      const chars = current.split('');
      let changed = false;

      // Find characters that don't match and transform one randomly
      const mismatchedIndices: number[] = [];
      for (let i = 0; i < Math.min(chars.length, to.length); i++) {
        if (chars[i] !== to[i]) {
          mismatchedIndices.push(i);
        }
      }

      // Also handle case where we have characters beyond the goal length
      if (chars.length > to.length) {
        for (let i = to.length; i < chars.length; i++) {
          mismatchedIndices.push(i);
        }
      }

      if (mismatchedIndices.length > 0) {
        const randomIndex = mismatchedIndices[Math.floor(Math.random() * mismatchedIndices.length)];
        
        // If this index is beyond the goal length, remove it (handled by length step) or transform if within range
        if (randomIndex < to.length) {
          chars[randomIndex] = transformCharacter(chars[randomIndex], to[randomIndex]);
          current = chars.join('');
          setCurrentString(current);
          changed = true;
        }
      }

      // If no characters were changed but we're not at goal, force a change on a valid character
      if (!changed && current !== to && chars.length > 0) {
        const validIndices = Array.from({ length: Math.min(chars.length, to.length) }, (_, i) => i);
        if (validIndices.length > 0) {
          const randomIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
          chars[randomIndex] = transformCharacter(chars[randomIndex], to[randomIndex]);
          current = chars.join('');
          setCurrentString(current);
        }
      }

      // Check if we've reached the goal (both length and content)
      if (current === to) {
        if (transformer.intervalId) {
          clearInterval(transformer.intervalId);
          transformer.intervalId = undefined;
        }
        if (transformer.lengthIntervalId) {
          clearInterval(transformer.lengthIntervalId);
          transformer.lengthIntervalId = undefined;
        }
        setIsTransforming(false);
        transformer.onComplete?.();
      }
    };

    // Start both intervals simultaneously
    transformer.lengthIntervalId = setInterval(lengthStep, lengthAdjustmentInterval);
    transformer.intervalId = setInterval(transformationStep, transformationInterval);
    transformerRef.current = transformer;
  }, [transformationInterval, lengthAdjustmentInterval, displayDuration, strings]);

  useEffect(() => {
    if (strings.length === 0) return;

    // Set initial string
    const firstString = strings[0];
    setCurrentString(firstString);
    currentIndexRef.current = 0;
    
    // Start with a hold phase, then begin first transformation
    displayTimeoutRef.current = setTimeout(() => {
      const secondString = strings[1] || strings[0];
      startTransformation(firstString, secondString);
      currentIndexRef.current = 1;
    }, displayDuration);

    return () => {
      if (displayTimeoutRef.current) {
        clearTimeout(displayTimeoutRef.current);
      }
      if (transformerRef.current?.intervalId) {
        clearInterval(transformerRef.current.intervalId);
      }
      if (transformerRef.current?.lengthIntervalId) {
        clearInterval(transformerRef.current.lengthIntervalId);
      }
    };
  }, [strings, startTransformation, displayDuration]);

  // If no strings provided, return empty
  if (strings.length === 0) {
    return <span className={className}>No strings provided</span>;
  }

  return (
    <span className={className}>
      {currentString}
      {isTransforming && <span style={{ animation: 'blink 1s infinite' }}></span>}
    </span>
  );
};

export default StringCycler;