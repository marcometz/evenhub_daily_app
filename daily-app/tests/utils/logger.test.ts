import { afterEach, describe, expect, it, vi } from "vitest";
import { Logger } from "../../src/utils/logger";

describe("Logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages with optional args", () => {
    const logger = new Logger();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const payload = { event: "click", index: 1 };

    logger.info("Dashboard Event", payload);

    expect(logSpy).toHaveBeenCalledWith("[info] Dashboard Event", payload);
  });

  it("logs debug messages with optional args", () => {
    const logger = new Logger();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.debug("Debug Trace", "extra", 42);

    expect(logSpy).toHaveBeenCalledWith("[debug] Debug Trace", "extra", 42);
  });
});
