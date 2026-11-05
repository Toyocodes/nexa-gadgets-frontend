import { createContext, use, useEffect } from "react";

export const MobileTitleContext = createContext<{ title: string; setTitle: (t: string) => void }>({
  title: "",
  setTitle: () => undefined,
});

export const useMobileTitleValue = () => use(MobileTitleContext).title;

/** Pages with the slim mobile header set its title (e.g. the product's category). */
export function useMobileTitle(title: string) {
  const { setTitle } = use(MobileTitleContext);
  useEffect(() => {
    setTitle(title);
    return () => setTitle("");
  }, [title, setTitle]);
}
