import { persisted } from "./persist.js";

// Games and apps saved with the "+" button, newest first.
export const mylist = persisted("sg:mylist", []);

export function inMyList(list, id) {
  return Array.isArray(list) && list.includes(id);
}

export function toggleMyList(id) {
  mylist.update((list) =>
    inMyList(list, id) ? list.filter((x) => x !== id) : [id, ...(list || [])],
  );
}
