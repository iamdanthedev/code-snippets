import { useState } from "react";
import { negate } from "lodash";

export function useArrayState<T>(initial: T[]) {
  const [items, setItems] = useState(initial);

  const includes = (item: T) => items.includes(item);
  const push = (item: T) => setItems(current => [...current, item]);
  const remove = (filter: (item: T) => boolean) =>
    setItems(current => current.filter(negate(filter)));
  const clear = () => setItems([]);

  const isEmpty = items.length === 0;

  return { value: items, setValue: setItems, push, remove, isEmpty, clear, includes };
}
