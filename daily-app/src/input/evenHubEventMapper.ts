import type { EvenHubEvent, OsEventTypeList } from "@evenrealities/even_hub_sdk";
import type { InputEvent } from "./keyBindings";

const typeMap: Record<number, InputEvent["type"]> = {
  0: "Click",
  1: "Up",
  2: "Down",
  3: "DoubleClick",
};

export function mapEvenHubEvent(
  event: EvenHubEvent,
  osEnum: typeof OsEventTypeList
): InputEvent | null {
  const listType = readEventTypeFromEventPart(event.listEvent);
  const textType = readEventTypeFromEventPart(event.textEvent);
  const sysType = readEventTypeFromEventPart(event.sysEvent);
  const jsonType = readEventTypeFromJsonData(event);
  const mappedType = mapKnownEventType([listType, textType, sysType, jsonType], osEnum);
  if (mappedType) {
    return { type: mappedType, raw: event };
  }

  if (listType === undefined && textType === undefined && sysType === undefined && jsonType === undefined) {
    // Legacy host behavior: list/text events without explicit type are treated as Click.
    if (event.listEvent || event.textEvent) {
      return { type: "Click", raw: event };
    }
    if (hasListSelectionPayload(event)) {
      return { type: "SelectionChange", raw: event };
    }
    return null;
  }

  if (hasListSelectionPayload(event)) {
    return { type: "SelectionChange", raw: event };
  }
  return null;
}

function readEventTypeFromJsonData(event: EvenHubEvent): unknown {
  const data = event.jsonData;
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  return record.eventType ?? record.event_type ?? record.Event_Type;
}

function readEventTypeFromEventPart(part: unknown): unknown {
  if (!part || typeof part !== "object") {
    return undefined;
  }

  const record = part as Record<string, unknown>;
  return record.eventType ?? record.event_type ?? record.Event_Type;
}

function mapKnownEventType(
  rawTypes: unknown[],
  osEnum: typeof OsEventTypeList
): InputEvent["type"] | null {
  for (const rawType of rawTypes) {
    if (rawType === undefined) {
      continue;
    }
    const normalized = osEnum.fromJson(rawType);
    if (normalized === undefined) {
      continue;
    }

    const mapped = typeMap[normalized];
    if (mapped) {
      return mapped;
    }
  }

  return null;
}

function hasListSelectionPayload(event: EvenHubEvent): boolean {
  return (
    hasSelectionPayloadInRecord(event.listEvent as Record<string, unknown> | undefined) ||
    hasSelectionPayloadInRecord(event.jsonData as Record<string, unknown> | undefined)
  );
}

function hasSelectionPayloadInRecord(record: Record<string, unknown> | undefined): boolean {
  if (!record || typeof record !== "object") {
    return false;
  }

  const name = readStringField(record, [
    "currentSelectItemName",
    "current_select_item_name",
    "CurrentSelect_ItemName",
    "currentSelect_ItemName",
  ]);
  const index = readNumberField(record, [
    "currentSelectItemIndex",
    "current_select_item_index",
    "CurrentSelect_ItemIndex",
    "currentSelect_ItemIndex",
  ]);

  return name !== null || index !== null;
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
