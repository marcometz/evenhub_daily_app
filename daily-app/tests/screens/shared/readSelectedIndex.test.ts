import { describe, expect, it } from "vitest";
import {
  readEventType,
  readSelectedIndex,
  readSelectedItemName,
} from "../../../src/screens/shared/readSelectedIndex";
import type { InputEvent } from "../../../src/input/keyBindings";

describe("readSelectedIndex helpers", () => {
  it("reads index and name from listEvent.toJson payload", () => {
    const event: InputEvent = {
      type: "Click",
      raw: {
        listEvent: {
          toJson: () => ({
            CurrentSelect_ItemIndex: "1",
            CurrentSelect_ItemName: "item2",
          }),
        },
      },
    };

    expect(readSelectedIndex(event)).toBe(1);
    expect(readSelectedItemName(event)).toBe("item2");
  });

  it("reads event type from listEvent.toJson payload", () => {
    const event: InputEvent = {
      type: "Click",
      raw: {
        listEvent: {
          toJson: () => ({
            Event_Type: 0,
          }),
        },
      },
    };

    expect(readEventType(event)).toBe(0);
  });
});
