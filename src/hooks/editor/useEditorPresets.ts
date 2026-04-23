import { useCallback, useEffect, useState } from "react";

import { getBrowserCookie, setBrowserCookie } from "@/lib/browserCookies";

export const useEditorPresets = <TValue>(cookieKey: string, initialValue: TValue) => {
  const [value, setValue] = useState<TValue>(initialValue);

  useEffect(() => {
    const stored = getBrowserCookie(cookieKey);
    if (!stored) return;

    try {
      setValue(JSON.parse(stored) as TValue);
    } catch (_error) {
      setValue(initialValue);
    }
  }, [cookieKey, initialValue]);

  const saveValue = useCallback(
    (nextValue: TValue) => {
      setValue(nextValue);
      setBrowserCookie(cookieKey, JSON.stringify(nextValue), 365);
    },
    [cookieKey],
  );

  return {
    value,
    setValue,
    saveValue,
  };
};
