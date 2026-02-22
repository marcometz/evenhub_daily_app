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
  const rawType = listType ?? textType ?? sysType ?? jsonType;

  if (rawType === undefined) {
    // Legacy host behavior: list/text events without explicit type are treated as Click.
    if (event.listEvent || event.textEvent) {
      return { type: "Click", raw: event };
    }
    return null;
  }

  const normalized = osEnum.fromJson(rawType);
  if (normalized === undefined) {
    if (hasListSelectionPayload(event)) {
      return { type: "SelectionChange", raw: event };
    }
    return null;
  }

  const mapped = typeMap[normalized];
  if (!mapped) {
    if (hasListSelectionPayload(event)) {
      return { type: "SelectionChange", raw: event };
    }
    return null;
  }

  return { type: mapped, raw: event };
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

function hasListSelectionPayload(event: EvenHubEvent): boolean {
  const listEvent = event.listEvent as Record<string, unknown> | undefined;
  if (!listEvent || typeof listEvent !== "object") {
    return false;
  }

  const name = readStringField(listEvent, [
    "currentSelectItemName",
    "current_select_item_name",
    "CurrentSelect_ItemName",
    "currentSelect_ItemName",
  ]);
  const index = readNumberField(listEvent, [
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
