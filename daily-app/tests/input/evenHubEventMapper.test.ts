import { describe, expect, it } from "vitest";
import type { EvenHubEvent } from "@evenrealities/even_hub_sdk";
import { OsEventTypeList } from "@evenrealities/even_hub_sdk";
import { mapEvenHubEvent } from "../../src/input/evenHubEventMapper";

describe("mapEvenHubEvent", () => {
  it("maps known click event type to Click", () => {
    const event = {
      listEvent: { eventType: OsEventTypeList.CLICK_EVENT },
    } as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "Click", raw: event });
  });

  it("maps unknown list event type with selection payload to SelectionChange", () => {
    const event = {
      listEvent: { eventType: "ITEM_HOVER_EVENT", currentSelectItemName: "Shopping List" },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "SelectionChange", raw: event });
  });

  it("maps known but unsupported event type with selection payload to SelectionChange", () => {
    const event = {
      listEvent: {
        eventType: OsEventTypeList.FOREGROUND_ENTER_EVENT,
        currentSelectItemIndex: 1,
      },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "SelectionChange", raw: event });
  });

  it("maps list event without eventType to Click for legacy compatibility", () => {
    const event = {
      listEvent: { currentSelectItemName: "Shopping List" },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "Click", raw: event });
  });

  it("detects selection payload in proto-style keys", () => {
    const event = {
      listEvent: { Event_Type: "ITEM_HOVER_EVENT", CurrentSelect_ItemIndex: "2" },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "SelectionChange", raw: event });
  });

  it("ignores unknown list event type without selection payload", () => {
    const event = {
      listEvent: { eventType: "ITEM_HOVER_EVENT" },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toBeNull();
  });
});
