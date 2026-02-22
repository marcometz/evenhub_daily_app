import type { Screen } from "../../navigation/screen";
import type { InputEvent } from "../../input/keyBindings";
import type { Logger } from "../../utils/logger";
import type { Router } from "../../navigation/router";
import { clamp } from "../../utils/clamp";
import { buildListViewModel } from "../../ui/components/ListView";
import type { ViewModel } from "../../ui/render/renderPipeline";

const PLACEHOLDER_ITEM = { id: "shopping-placeholder", label: "Coming soon" };

export function createShoppingListScreen(logger: Logger, router: Router): Screen {
  const list = {
    id: "shopping-list",
    title: "Shopping List",
    items: [PLACEHOLDER_ITEM],
  };
  let selectedIndex = 0;

  return {
    id: "list:shopping-list",
    onEnter() {
      logger.info("Enter Shopping List");
    },
    onExit() {
      logger.info("Exit Shopping List");
    },
    onInput(event: InputEvent) {
      const maxIndex = Math.max(0, list.items.length - 1);

      if (event.type === "Up") {
        selectedIndex = clamp(selectedIndex - 1, 0, maxIndex);
      }

      if (event.type === "Down") {
        selectedIndex = clamp(selectedIndex + 1, 0, maxIndex);
      }

      if (event.type === "Click") {
        logger.info("Shopping List placeholder clicked");
      }

      if (event.type === "DoubleClick") {
        router.back();
      }
    },
    getViewModel(): ViewModel {
      return buildListViewModel(list, selectedIndex);
    },
  };
}
