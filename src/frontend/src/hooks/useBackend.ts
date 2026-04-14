import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

const ACTOR_QUERY_KEY = "backend-actor";

/**
 * Custom useBackend hook that ensures the authenticated Internet Identity
 * is always passed to the actor.
 *
 * IMPORTANT: The actor is ONLY created once the identity is fully available
 * and confirmed to be non-anonymous. No anonymous actor is ever created.
 * This prevents backend calls from being made with the anonymous principal
 * (2vxsx-fae), which would cause "Unauthorized" errors for admin operations.
 */
export function useBackend(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const { identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Identity is ready when login has succeeded and it's not the anonymous principal.
  const isIdentityReady = !!identity && !identity.getPrincipal().isAnonymous();

  // Include principal text in query key so actor is recreated on identity change.
  const principalKey = isIdentityReady
    ? identity.getPrincipal().toText()
    : null;

  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, principalKey],
    queryFn: async (): Promise<backendInterface | null> => {
      // Double-check inside queryFn — never create an anonymous actor.
      if (!identity || identity.getPrincipal().isAnonymous()) {
        return null;
      }

      // Pass the authenticated identity so the HttpAgent signs with the
      // correct principal (e.g. stg4z-... for admin).
      const actor = await createActorWithConfig(createActor, {
        agentOptions: { identity },
      });

      // Debug: confirm the backend sees the authenticated principal.
      try {
        const callerPrincipal = await (
          actor as backendInterface
        ).getCallerPrincipal();
        console.log(
          "[useBackend] Backend caller principal:",
          callerPrincipal,
          "| Expected:",
          identity.getPrincipal().toText(),
        );
      } catch (err) {
        console.warn("[useBackend] getCallerPrincipal() failed:", err);
      }

      return actor as backendInterface;
    },
    // Only run this query when identity is available and non-anonymous.
    enabled: isIdentityReady && loginStatus !== "initializing",
    // Never cache stale — always use fresh actor after re-login.
    staleTime: 0,
  });

  // When the actor changes (e.g. after login), invalidate all data queries
  // so they refetch with the correct identity context.
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data ?? null,
    isFetching: actorQuery.isFetching,
  };
}
