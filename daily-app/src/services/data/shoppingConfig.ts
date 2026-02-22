export interface EditableShoppingItem {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export const SHOPPING_STORAGE_KEY = "shopping_config_v1";
export const SHOPPING_STORAGE_VERSION = 1;

export const DEFAULT_SHOPPING_ITEMS: EditableShoppingItem[] = [];
