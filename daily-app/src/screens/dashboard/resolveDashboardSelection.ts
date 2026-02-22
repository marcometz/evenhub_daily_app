import type { InputEvent } from "../../input/keyBindings";
import type { DashboardItem } from "../../services/data/DataService";
import { clamp } from "../../utils/clamp";
import { readSelectedIndex, readSelectedItemName } from "../shared/readSelectedIndex";

export interface ResolveDashboardSelectionParams {
  items: DashboardItem[];
  currentSelectedIndex: number;
  event: InputEvent;
}

export interface ResolveDashboardSelectionResult {
  nextSelectedIndex: number;
  targetListId: string | null;
}

export function resolveDashboardSelection(
  params: ResolveDashboardSelectionParams
): ResolveDashboardSelectionResult {
  const { items, currentSelectedIndex, event } = params;
  if (items.length === 0) {
    return { nextSelectedIndex: 0, targetListId: null };
  }

  const maxIndex = Math.max(0, items.length - 1);
  let nextSelectedIndex = clamp(currentSelectedIndex, 0, maxIndex);
  const resolvedIndex = resolveSelectionIndex(items, event, maxIndex);
  if (resolvedIndex !== null) {
    nextSelectedIndex = clamp(resolvedIndex, 0, maxIndex);
  }

  if (event.type === "Up") {
    nextSelectedIndex = clamp(nextSelectedIndex - 1, 0, maxIndex);
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type === "Down") {
    nextSelectedIndex = clamp(nextSelectedIndex + 1, 0, maxIndex);
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type === "SelectionChange") {
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type !== "Click") {
    return { nextSelectedIndex, targetListId: null };
  }

  const targetListId = items[nextSelectedIndex]?.listId ?? null;

  return { nextSelectedIndex, targetListId };
}

function resolveSelectionIndex(
  items: DashboardItem[],
  event: InputEvent,
  maxIndex: number
): number | null {
  const selectedName = readSelectedItemName(event);
  if (selectedName) {
    const normalizedSelectedName = selectedName.trim().toLowerCase();
    const matchedIndex = items.findIndex(
      (item) =>
        item.label.trim().toLowerCase() === normalizedSelectedName ||
        item.id.trim().toLowerCase() === normalizedSelectedName
    );
    if (matchedIndex >= 0) {
      return matchedIndex;
    }

    const numberedMatch = /^item\s*(\d+)$/i.exec(selectedName.trim());
    if (numberedMatch) {
      const oneBasedIndex = Number(numberedMatch[1]);
      if (Number.isFinite(oneBasedIndex) && oneBasedIndex >= 1) {
        return clamp(oneBasedIndex - 1, 0, maxIndex);
      }
    }
  }

  const selectedIndex = readSelectedIndex(event);
  if (selectedIndex === null) {
    return null;
  }

  return normalizeEventIndex(selectedIndex, maxIndex);
}

function normalizeEventIndex(selectedIndex: number, maxIndex: number): number {
  if (!Number.isFinite(selectedIndex)) {
    return 0;
  }

  if (selectedIndex < 0) {
    return 0;
  }

  // Prefer zero-based indexes when in-range.
  if (selectedIndex <= maxIndex) {
    return clamp(selectedIndex, 0, maxIndex);
  }

  // One-based fallback only for out-of-range payloads (e.g. 2 for second item in a 2-item list).
  if (selectedIndex > maxIndex) {
    return clamp(selectedIndex - 1, 0, maxIndex);
  }

  return clamp(selectedIndex, 0, maxIndex);
}
