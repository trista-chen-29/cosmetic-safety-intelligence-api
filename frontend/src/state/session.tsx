import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/api";

export type AnalysisSession = {
  input: AnalyzeRequest;
  result: AnalyzeResponse;
  photoPreview: string | null;
};

export type DraftPhoto = {
  previewUrl: string;
  photoBase64: string;
};

type SessionContextValue = {
  draftPhoto: DraftPhoto | null;
  setDraftPhoto: (photo: DraftPhoto | null) => void;
  session: AnalysisSession | null;
  setSession: (session: AnalysisSession | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [draftPhoto, setDraftPhoto] = useState<DraftPhoto | null>(null);
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const value = useMemo(
    () => ({ draftPhoto, setDraftPhoto, session, setSession }),
    [draftPhoto, session],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
