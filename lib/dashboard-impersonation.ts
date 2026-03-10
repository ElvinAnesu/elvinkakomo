import { supabase } from "@/lib/supabase";

export const DASHBOARD_IMPERSONATION_KEY = "admin_view_as_client";

interface StoredImpersonation {
  clientId: string;
  clientName: string;
}

interface ProfileRow {
  id: string;
  name: string | null;
  role: string | null;
}

export interface DashboardClientContext {
  authenticated: boolean;
  effectiveClientId: string | null;
  effectiveClientName: string;
  isAdmin: boolean;
  isImpersonating: boolean;
}

const getFallbackName = (email?: string | null): string => {
  if (!email) return "User";
  return email.split("@")[0] || "User";
};

export const getStoredImpersonation = (): StoredImpersonation | null => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(DASHBOARD_IMPERSONATION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredImpersonation>;
    if (!parsed.clientId || !parsed.clientName) {
      return null;
    }
    return {
      clientId: parsed.clientId,
      clientName: parsed.clientName,
    };
  } catch {
    return null;
  }
};

export const setStoredImpersonation = (value: StoredImpersonation): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DASHBOARD_IMPERSONATION_KEY, JSON.stringify(value));
};

export const clearStoredImpersonation = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DASHBOARD_IMPERSONATION_KEY);
};

export const resolveDashboardClientContext = async (): Promise<DashboardClientContext> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authenticated: false,
      effectiveClientId: null,
      effectiveClientName: "User",
      isAdmin: false,
      isImpersonating: false,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", user.id)
    .single<ProfileRow>();

  if (profileError || !profile) {
    return {
      authenticated: true,
      effectiveClientId: null,
      effectiveClientName: getFallbackName(user.email),
      isAdmin: false,
      isImpersonating: false,
    };
  }

  const currentUserName = profile.name || getFallbackName(user.email);
  const isAdmin = profile.role === "admin";

  if (!isAdmin) {
    clearStoredImpersonation();
    return {
      authenticated: true,
      effectiveClientId: profile.id,
      effectiveClientName: currentUserName,
      isAdmin: false,
      isImpersonating: false,
    };
  }

  const stored = getStoredImpersonation();
  if (!stored) {
    return {
      authenticated: true,
      effectiveClientId: profile.id,
      effectiveClientName: currentUserName,
      isAdmin: true,
      isImpersonating: false,
    };
  }

  const { data: clientProfile, error: clientError } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", stored.clientId)
    .eq("role", "client")
    .single<ProfileRow>();

  if (clientError || !clientProfile) {
    clearStoredImpersonation();
    return {
      authenticated: true,
      effectiveClientId: profile.id,
      effectiveClientName: currentUserName,
      isAdmin: true,
      isImpersonating: false,
    };
  }

  return {
    authenticated: true,
    effectiveClientId: clientProfile.id,
    effectiveClientName: clientProfile.name || stored.clientName,
    isAdmin: true,
    isImpersonating: true,
  };
};
