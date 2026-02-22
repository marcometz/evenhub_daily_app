import type { InputEvent } from "../../input/keyBindings";
import type { DashboardItem } from "../../services/data/DataService";
import { clamp } from "../../utils/clamp";
import { readSelectedIndex, readSelectedItemName } from "../shared/readSelectedIndex";
import type { Logger } from "../../utils/logger";

export interface ResolveDashboardSelectionParams {
  items: DashboardItem[];
  currentSelectedIndex: number;
  event: InputEvent;
  logger: Logger;
}

export interface ResolveDashboardSelectionResult {
  nextSelectedIndex: number;
  targetListId: string | null;
}

export function resolveDashboardSelection(
  params: ResolveDashboardSelectionParams
): ResolveDashboardSelectionResult {
  const { items, currentSelectedIndex, event, logger } = params;
  logger.debug(
    `Dashboard resolver input -> event:${event.type} currentIndex:${currentSelectedIndex} itemCount:${items.length}`
  );

  if (items.length === 0) {
    logger.debug("Dashboard resolver result -> empty dashboard, no target");
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
    logger.debug(`Dashboard resolver result -> up, nextIndex:${nextSelectedIndex}, target:-`);
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type === "Down") {
    nextSelectedIndex = clamp(nextSelectedIndex + 1, 0, maxIndex);
    logger.debug(`Dashboard resolver result -> down, nextIndex:${nextSelectedIndex}, target:-`);
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type === "SelectionChange") {
    logger.debug(`Dashboard resolver result -> hover, nextIndex:${nextSelectedIndex}, target:-`);
    return { nextSelectedIndex, targetListId: null };
  }

  if (event.type !== "Click") {
    logger.debug(`Dashboard resolver result -> non-click, nextIndex:${nextSelectedIndex}, target:-`);
    return { nextSelectedIndex, targetListId: null };
  }

  const targetListId = items[nextSelectedIndex]?.listId ?? null;
  logger.debug(`Dashboard resolver result -> click, nextIndex:${nextSelectedIndex}, target:${targetListId ?? "-"}`);

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
