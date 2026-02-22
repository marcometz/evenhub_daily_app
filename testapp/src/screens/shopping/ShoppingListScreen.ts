import type { Screen } from "../../navigation/screen";
import type { InputEvent } from "../../input/keyBindings";
import type { Logger } from "../../utils/logger";
import type { Router } from "../../navigation/router";
import type { DataService, ListData, ListItem } from "../../services/data/DataService";
import { SHOPPING_DIVIDER_ITEM_ID } from "../../services/data/RssAppDataService";
import { clamp } from "../../utils/clamp";
import { buildListViewModel } from "../../ui/components/ListView";
import type { ViewModel } from "../../ui/render/renderPipeline";
import { readSelectedIndex } from "../shared/readSelectedIndex";

const STATUS_ITEM_ID = "__shopping-status__";

export function createShoppingListScreen(
  listId: string,
  dataService: DataService,
  logger: Logger,
  router: Router,
  requestRender: () => void
): Screen {
  let selectedIndex = 0;
  let isLoading = false;
  let loadError: string | null = null;
  let refreshSequence = 0;

  async function refresh(): Promise<void> {
    const sequence = refreshSequence + 1;
    refreshSequence = sequence;

    isLoading = true;
    loadError = null;
    requestRender();

    try {
      await dataService.refreshList(listId);
      if (sequence !== refreshSequence) {
        return;
      }
      const list = dataService.getList(listId);
      selectedIndex = clamp(selectedIndex, 0, Math.max(0, list.items.length - 1));
    } catch (error) {
      if (sequence !== refreshSequence) {
        return;
      }
      loadError = error instanceof Error ? error.message : "Unbekannter Shopping-Fehler";
    } finally {
      if (sequence !== refreshSequence) {
        return;
      }
      isLoading = false;
      requestRender();
    }
  }

  async function toggleSelectedItem(item: ListItem): Promise<void> {
    if (item.id === STATUS_ITEM_ID || item.id === SHOPPING_DIVIDER_ITEM_ID) {
      return;
    }

    try {
      await dataService.toggleShoppingItem(item.id);
      loadError = null;
    } catch (error) {
      loadError = error instanceof Error ? error.message : "Shopping-Eintrag konnte nicht aktualisiert werden.";
    }

    const nextList = dataService.getList(listId);
    const nextIndex = nextList.items.findIndex((entry) => entry.id === item.id);
    if (nextIndex >= 0) {
      selectedIndex = nextIndex;
    } else {
      selectedIndex = clamp(selectedIndex, 0, Math.max(0, nextList.items.length - 1));
    }
    requestRender();
  }

  return {
    id: `list:${listId}`,
    onEnter() {
      logger.info(`Enter List ${listId}`);
      void refresh();
    },
    onExit() {
      refreshSequence += 1;
      logger.info(`Exit List ${listId}`);
    },
    onInput(event: InputEvent) {
      const list = dataService.getList(listId);
      const hasItems = list.items.length > 0;
      const maxIndex = Math.max(0, list.items.length - 1);
      const eventIndex = readSelectedIndex(event);

      if (eventIndex !== null && hasItems) {
        selectedIndex = clamp(eventIndex, 0, maxIndex);
      }

      if (event.type === "Up" && hasItems) {
        selectedIndex = clamp(selectedIndex - 1, 0, maxIndex);
      }

      if (event.type === "Down" && hasItems) {
        selectedIndex = clamp(selectedIndex + 1, 0, maxIndex);
      }

      if (event.type === "Click" && hasItems) {
        const item = list.items[selectedIndex];
        if (item) {
          void toggleSelectedItem(item);
        }
      }

      if (event.type === "DoubleClick") {
        router.back();
      }
    },
    getViewModel(): ViewModel {
      const visible = withStatusState(dataService.getList(listId), isLoading, loadError);
      const boundedIndex = clamp(selectedIndex, 0, Math.max(0, visible.items.length - 1));
      return buildListViewModel(visible, boundedIndex);
    },
  };
}

function withStatusState(list: ListData, isLoading: boolean, loadError: string | null): ListData {
  if (list.items.length > 0) {
    if (isLoading) {
      return { ...list, title: `${list.title} (laedt...)` };
    }

    if (loadError) {
      return { ...list, title: `${list.title} (letzter Stand)` };
    }

    return list;
  }

  const message = isLoading
    ? "Shopping-Liste wird geladen..."
    : loadError
      ? `Fehler: ${loadError}`
      : "Keine Shopping-Eintraege vorhanden.";

  return {
    ...list,
    items: [{ id: STATUS_ITEM_ID, label: message }],
  };
}
