"use client";

import { useEffect, useMemo } from "react";

/**
 * Custom hook to create and manage object URLs for File objects.
 * Automatically cleans up URLs when files change or component unmounts.
 *
 * @param files - Array of File objects to create URLs for
 * @returns Array of object URLs corresponding to the input files
 */
export function useObjectUrls(files: File[]): string[] {
  const urls = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  useEffect(() => {
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urls]);

  return urls;
}
