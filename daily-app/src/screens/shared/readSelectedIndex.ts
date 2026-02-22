import type { InputEvent } from "../../input/keyBindings";

export function readSelectedIndex(event: InputEvent): number | null {
  const raw = event.raw;
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const listEvent = record.listEvent;
  if (listEvent && typeof listEvent === "object") {
    const listRecord = listEvent as Record<string, unknown>;
    const index = listRecord.currentSelectItemIndex;
    if (typeof index === "number" && Number.isFinite(index)) {
      return index;
    }
  }

  const jsonData = record.jsonData;
  if (jsonData && typeof jsonData === "object") {
    const jsonRecord = jsonData as Record<string, unknown>;
    const index = jsonRecord.currentSelectItemIndex;
    if (typeof index === "number" && Number.isFinite(index)) {
      return index;
    }
  }

  return null;
}

export function readSelectedItemName(event: InputEvent): string | null {
  const raw = event.raw;
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const listEvent = record.listEvent;
  if (listEvent && typeof listEvent === "object") {
    const listRecord = listEvent as Record<string, unknown>;
    const name = listRecord.currentSelectItemName;
    if (typeof name === "string" && name.trim().length > 0) {
      return name;
    }
  }

  const jsonData = record.jsonData;
  if (jsonData && typeof jsonData === "object") {
    const jsonRecord = jsonData as Record<string, unknown>;
    const name = jsonRecord.currentSelectItemName;
    if (typeof name === "string" && name.trim().length > 0) {
      return name;
    }
  }

  return null;
}
