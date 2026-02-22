import type { Screen } from "../navigation/screen";
import type { InputEvent } from "../input/keyBindings";
import type { DataService } from "../services/data/DataService";
import { RSS_LIST_ID } from "../services/data/RssAppDataService";
import type { Logger } from "../utils/logger";
import type { Router } from "../navigation/router";
import { clamp } from "../utils/clamp";
import { buildDashboardViewModel } from "../ui/components/DashboardView";
import type { ViewModel } from "../ui/render/renderPipeline";
import { resolveDashboardSelection } from "./dashboard/resolveDashboardSelection";
import { readEventType } from "./shared/readSelectedIndex";

export function createDashboardScreen(
  router: Router,
  dataService: DataService,
  logger: Logger
): Screen {
  const id = "dashboard";
  let selectedIndex = 0;

  return {
    id,
    onEnter() {
      logger.info("Enter Dashboard");
    },
    onExit() {
      logger.info("Exit Dashboard");
    },
    onInput(event: InputEvent) {
      const dashboard = dataService.getDashboard();
      const previousSelectedIndex = selectedIndex;
      const result = resolveDashboardSelection({
        items: dashboard.items,
        currentSelectedIndex: selectedIndex,
        event,
      });
      selectedIndex = result.nextSelectedIndex;

      if (event.type === "Click") {
        if (isImplicitSelectionUpdateClick(event, previousSelectedIndex, selectedIndex)) {
          return;
        }
        const targetListId =
          result.targetListId ?? (dashboard.items.length > 0 ? RSS_LIST_ID : null);
        if (targetListId) {
          logger.info(`Dashboard click -> list:${targetListId}`);
          router.toList(targetListId);
        }
      }
    },
    getViewModel(): ViewModel {
      const dashboard = dataService.getDashboard();
      return buildDashboardViewModel(
        dashboard,
        clamp(selectedIndex, 0, Math.max(0, dashboard.items.length - 1))
      );
    },
  };
}

function isImplicitSelectionUpdateClick(
  event: InputEvent,
  previousSelectedIndex: number,
  nextSelectedIndex: number
): boolean {
  if (event.type !== "Click") {
    return false;
  }

  const rawType = readEventType(event);
  if (rawType !== undefined) {
    return false;
  }

  return previousSelectedIndex !== nextSelectedIndex;
}
