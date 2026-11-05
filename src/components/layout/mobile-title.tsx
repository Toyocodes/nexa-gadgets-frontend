import { useState } from "react";
import { MobileTitleContext } from "./mobile-title-context";

export function MobileTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");
  return <MobileTitleContext value={{ title, setTitle }}>{children}</MobileTitleContext>;
}
