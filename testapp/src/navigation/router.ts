import type { ScreenStack } from "./stack";
import type { DataService } from "../services/data/DataService";
import {
  RSS_LIST_ID,
  SHOPPING_LIST_ID,
} from "../services/data/RssAppDataService";
import { createRssFeedListScreen } from "../screens/rss/RssFeedListScreen";
import { createRssFeedDetailScreen } from "../screens/rss/RssFeedDetailScreen";
import { createShoppingListScreen } from "../screens/shopping/ShoppingListScreen";
import type { Logger } from "../utils/logger";

export interface Router {
  toList(listId: string): void;
  toDetail(itemId: string): void;
  back(): void;
}

export function createRouter(stack: ScreenStack, dataService: DataService, logger: Logger): Router {
  const requestRender = () => stack.render();

  const router: Router = {
    toList(listId: string) {
      if (listId === RSS_LIST_ID) {
        const screen = createRssFeedListScreen(listId, dataService, logger, router, requestRender);
        stack.push(screen);
        return;
      }

      if (listId === SHOPPING_LIST_ID) {
        const screen = createShoppingListScreen(logger, router);
        stack.push(screen);
        return;
      }

      logger.info(`Unknown list requested: ${listId}`);
      return;
    },
    toDetail(itemId: string) {
      const screen = createRssFeedDetailScreen(itemId, dataService, logger, router, requestRender);
      stack.push(screen);
    },
    back() {
      stack.pop();
    },
  };

  return router;
}
