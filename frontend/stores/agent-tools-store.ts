import { create } from "zustand";

import { apiFetch } from "@/lib/api/client-fetch";
import type { AgentToolAssignment, AgentToolId } from "@/lib/tools/types";

type Banner = { type: "success" | "error"; message: string };

type AgentToolsStore = {
  toolsByAgent: Record<string, AgentToolAssignment[]>;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  configuringToolId: AgentToolId | null;
  banner: Banner | null;
  fetchAgentTools: (agentId: string) => Promise<void>;
  toggleTool: (agentId: string, toolId: AgentToolId, enabled: boolean) => Promise<void>;
  saveToolConfig: (
    agentId: string,
    toolId: AgentToolId,
    update: Partial<AgentToolAssignment>,
  ) => Promise<void>;
  testTool: (agentId: string, toolId: AgentToolId) => Promise<void>;
  setConfiguringTool: (toolId: AgentToolId | null) => void;
  clearBanner: () => void;
};

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const useAgentToolsStore = create<AgentToolsStore>((set) => ({
  toolsByAgent: {},
  isLoading: false,
  isSaving: false,
  isTesting: false,
  configuringToolId: null,
  banner: null,

  fetchAgentTools: async (agentId) => {
    set({ isLoading: true });
    try {
      const data = await parseJson<{ tools: AgentToolAssignment[] }>(
        await apiFetch(`/agents/${agentId}/tools`),
      );
      set((s) => ({
        toolsByAgent: { ...s.toolsByAgent, [agentId]: data.tools },
        isLoading: false,
      }));
    } catch (e) {
      set({
        isLoading: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Failed to load tools",
        },
      });
    }
  },

  toggleTool: async (agentId, toolId, enabled) => {
    set({ isSaving: true, banner: null });
    try {
      const data = await parseJson<{ tool: AgentToolAssignment }>(
        await apiFetch(`/agents/${agentId}/tools/${toolId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }),
      );
      set((s) => ({
        toolsByAgent: {
          ...s.toolsByAgent,
          [agentId]: (s.toolsByAgent[agentId] ?? []).map((t) =>
            t.toolId === toolId ? data.tool : t,
          ),
        },
        isSaving: false,
      }));
    } catch (e) {
      set({
        isSaving: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Failed to update tool",
        },
      });
    }
  },

  saveToolConfig: async (agentId, toolId, update) => {
    set({ isSaving: true, banner: null });
    try {
      const data = await parseJson<{ tool: AgentToolAssignment }>(
        await apiFetch(`/agents/${agentId}/tools/${toolId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }),
      );
      set((s) => ({
        toolsByAgent: {
          ...s.toolsByAgent,
          [agentId]: (s.toolsByAgent[agentId] ?? []).map((t) =>
            t.toolId === toolId ? data.tool : t,
          ),
        },
        isSaving: false,
        configuringToolId: null,
        banner: { type: "success", message: "Tool configuration saved" },
      }));
    } catch (e) {
      set({
        isSaving: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Failed to save configuration",
        },
      });
    }
  },

  testTool: async (agentId, toolId) => {
    set({ isTesting: true, banner: null });
    try {
      const data = await parseJson<{ tool: AgentToolAssignment; testResult: string }>(
        await apiFetch(`/agents/${agentId}/tools/${toolId}`, {
          method: "POST",
        }),
      );
      set((s) => ({
        toolsByAgent: {
          ...s.toolsByAgent,
          [agentId]: (s.toolsByAgent[agentId] ?? []).map((t) =>
            t.toolId === toolId ? data.tool : t,
          ),
        },
        isTesting: false,
        banner: { type: "success", message: "Tool health check passed" },
      }));
    } catch (e) {
      set({
        isTesting: false,
        banner: {
          type: "error",
          message: e instanceof Error ? e.message : "Health check failed",
        },
      });
    }
  },

  setConfiguringTool: (toolId) => set({ configuringToolId: toolId }),
  clearBanner: () => set({ banner: null }),
}));
