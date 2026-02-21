import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "completed_recipe_ids";

async function getCompletedRecipeIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function markRecipeCompleted(id: string): Promise<void> {
  const ids = await getCompletedRecipeIds();
  ids.add(id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export { getCompletedRecipeIds, markRecipeCompleted };
