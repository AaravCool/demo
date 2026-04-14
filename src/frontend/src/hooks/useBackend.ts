import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createActor } from "../backend";
import type { backendInterface } from "../backend";

const ACTOR_QUERY_KEY = "backend-actor";

/**
 * Custom useBackend hook that ensures the authenticated Internet Identity
 * is always passed to the actor. This bypasses the built-in useActor to
 * guarantee the identity flows correctly through to the HttpAgent.
 */
export function useBackend(): {
  actor: backendInterface | null;
  isFetching: boolean;
} {
  const { identity, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Use the principal text as the query key so the actor is recreated
  // whenever the identity changes (login / logout).
  const principalKey = identity?.getPrincipal().toText() ?? "anonymous";

  const actorQuery = useQuery({
    queryKey: [ACTOR_QUERY_KEY, principalKey],
    queryFn: async () => {
      if (!identity || identity.getPrincipal().isAnonymous()) {
        // Return anonymous actor
        return createActorWithConfig(createActor) as Promise<backendInterface>;
      }

      // Pass the identity explicitly so the HttpAgent signs requests
      // with the correct principal (e.g. stg4z-... for admin).
      const actor = await createActorWithConfig(createActor, {
        agentOptions: { identity },
      });
      return actor as backendInterface;
    },
    // Never stale — only recreate when the identity (queryKey) changes.
    staleTime: Number.POSITIVE_INFINITY,
    enabled: loginStatus !== "initializing",
  });

  // When the actor changes, invalidate all data queries so they refetch
  // with the correct identity context.
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
