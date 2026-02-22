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

  it("maps numeric string event type to Click", () => {
    const event = {
      sysEvent: { eventType: "0" },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "Click", raw: event });
  });

  it("maps sys event click type from toJson payload to Click", () => {
    const event = {
      sysEvent: {
        toJson: () => ({
          Event_Type: 0,
        }),
      },
    } as unknown as EvenHubEvent;

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

  it("prefers a supported sys event type when list event type is unknown", () => {
    const event = {
      listEvent: { eventType: "ITEM_HOVER_EVENT" },
      sysEvent: { eventType: OsEventTypeList.SCROLL_BOTTOM_EVENT },
    } as unknown as EvenHubEvent;

    const mapped = mapEvenHubEvent(event, OsEventTypeList);

    expect(mapped).toEqual({ type: "Down", raw: event });
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

  it("detects selection payload from listEvent.toJson proto keys", () => {
    const event = {
      listEvent: {
        toJson: () => ({
          Event_Type: "ITEM_HOVER_EVENT",
          CurrentSelect_ItemName: "Shopping List",
        }),
      },
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
