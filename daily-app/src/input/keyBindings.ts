export type InputEventType = "Up" | "Down" | "Click" | "DoubleClick" | "SelectionChange";

export interface InputEvent {
  type: InputEventType;
  raw?: unknown;
}
