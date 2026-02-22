import type { InputEvent } from "../../input/keyBindings";

export function readSelectedIndex(event: InputEvent): number | null {
  const record = normalizeRecord(event.raw);
  if (!record) {
    return null;
  }

  const listEvent = normalizeRecord(record.listEvent);
  if (listEvent) {
    const index = readNumberField(listEvent, [
      "currentSelectItemIndex",
      "current_select_item_index",
      "CurrentSelect_ItemIndex",
      "currentSelect_ItemIndex",
    ]);
    if (index !== null) {
      return index;
    }
  }

  const jsonData = normalizeRecord(record.jsonData);
  if (jsonData) {
    const index = readNumberField(jsonData, [
      "currentSelectItemIndex",
      "current_select_item_index",
      "CurrentSelect_ItemIndex",
      "currentSelect_ItemIndex",
    ]);
    if (index !== null) {
      return index;
    }
  }

  return null;
}

export function readSelectedItemName(event: InputEvent): string | null {
  const record = normalizeRecord(event.raw);
  if (!record) {
    return null;
  }

  const listEvent = normalizeRecord(record.listEvent);
  if (listEvent) {
    const name = readStringField(listEvent, [
      "currentSelectItemName",
      "current_select_item_name",
      "CurrentSelect_ItemName",
      "currentSelect_ItemName",
    ]);
    if (name !== null) {
      return name;
    }
  }

  const jsonData = normalizeRecord(record.jsonData);
  if (jsonData) {
    const name = readStringField(jsonData, [
      "currentSelectItemName",
      "current_select_item_name",
      "CurrentSelect_ItemName",
      "currentSelect_ItemName",
    ]);
    if (name !== null) {
      return name;
    }
  }

  return null;
}

export function readEventType(event: InputEvent): unknown {
  const record = normalizeRecord(event.raw);
  if (!record) {
    return undefined;
  }

  const parts = [record.listEvent, record.textEvent, record.sysEvent, record.jsonData];
  for (const part of parts) {
    const partRecord = normalizeRecord(part);
    if (!partRecord) {
      continue;
    }
    const rawType = partRecord.eventType ?? partRecord.event_type ?? partRecord.Event_Type;
    if (rawType !== undefined) {
      return rawType;
    }
  }

  return undefined;
}

function readNumberField(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function readStringField(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function normalizeRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return normalizeRecord(parsed);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const base = value as Record<string, unknown>;
  const toJsonRecord = readToJsonRecord(value);
  if (!toJsonRecord) {
    return base;
  }

  return {
    ...base,
    ...toJsonRecord,
  };
}

function readToJsonRecord(value: unknown): Record<string, unknown> | null {
  const candidate = value as { toJson?: () => unknown };
  if (typeof candidate.toJson !== "function") {
    return null;
  }

  try {
    const json = candidate.toJson();
    if (!json || typeof json !== "object") {
      return null;
    }
    return json as Record<string, unknown>;
  } catch {
    return null;
  }
}
