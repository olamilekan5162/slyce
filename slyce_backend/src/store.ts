import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "../splits.json");

export function loadTrackedSplits(): Set<string> {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return new Set();
    }
    const data = fs.readFileSync(STORE_PATH, "utf8");
    const arr = JSON.parse(data);
    return new Set(arr);
  } catch (err) {
    console.error("Error loading tracked splits:", err);
    return new Set();
  }
}

export function saveTrackedSplits(splits: Set<string>) {
  try {
    const data = JSON.stringify(Array.from(splits), null, 2);
    fs.writeFileSync(STORE_PATH, data, "utf8");
  } catch (err) {
    console.error("Error saving tracked splits:", err);
  }
}

export function addTrackedSplit(splitId: string) {
  const splits = loadTrackedSplits();
  if (!splits.has(splitId)) {
    splits.add(splitId);
    saveTrackedSplits(splits);
    console.log(`[Store] Added new tracked split: ${splitId}`);
  }
}
