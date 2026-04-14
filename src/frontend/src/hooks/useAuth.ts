import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { truncatePrincipal } from "../types";

export interface AuthContext {
  isAuthenticated: boolean;
  isInitializing: boolean;
  identity: ReturnType<typeof useInternetIdentity>["identity"];
  principal: Principal | null;
  /** Full principal ID string — use this for access control comparisons */
  principalId: string | null;
  /** @deprecated use principalId for comparisons; this is the full text too */
  principalText: string | null;
  principalTruncated: string | null;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthContext {
  const { identity, login, clear, loginStatus, isInitializing } =
    useInternetIdentity();

  const isAuthenticated =
    loginStatus === "success" ||
    (loginStatus === "idle" && identity !== undefined);

  const principal = identity?.getPrincipal() ?? null;
  const truncated = principal ? truncatePrincipal(principal) : null;
  const principalId = principal ? principal.toText() : null;

  return {
    isAuthenticated,
    isInitializing,
    identity,
    principal,
    principalId,
    principalText: truncated?.full ?? null,
    principalTruncated: truncated?.truncated ?? null,
    login,
    logout: clear,
  };
}
