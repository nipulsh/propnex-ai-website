"use client";

import type { FaqToolConfig } from "@/lib/tools/types";
import type { KnowledgeSource } from "@/lib/agents-data";

type FaqToolConfigFormProps = {
  config: FaqToolConfig;
  knowledgeSources: KnowledgeSource[];
  onChange: (config: FaqToolConfig) => void;
};

export function FaqToolConfigForm({
  config,
  knowledgeSources,
  onChange,
}: FaqToolConfigFormProps) {
  function toggleSource(id: string) {
    const ids = config.knowledgeSourceIds.includes(id)
      ? config.knowledgeSourceIds.filter((s) => s !== id)
      : [...config.knowledgeSourceIds, id];
    onChange({ ...config, knowledgeSourceIds: ids });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-propnex-muted">
          Knowledge Base Selection
        </label>
        {knowledgeSources.length === 0 ? (
          <p className="text-sm text-propnex-muted">
            No knowledge sources on this agent. Add sources in the Knowledge
            section.
          </p>
        ) : (
          <div className="space-y-2">
            {knowledgeSources.map((source) => (
              <label
                key={source.id}
                className="flex items-center gap-2 rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={config.knowledgeSourceIds.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="size-4"
                />
                {source.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-propnex-muted">
          Confidence Threshold: {Math.round(config.confidenceThreshold * 100)}%
        </label>
        <input
          type="range"
          min={50}
          max={100}
          value={config.confidenceThreshold * 100}
          onChange={(e) =>
            onChange({
              ...config,
              confidenceThreshold: Number(e.target.value) / 100,
            })
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-propnex-muted">
          Fallback Response
        </label>
        <textarea
          value={config.fallbackResponse}
          onChange={(e) =>
            onChange({ ...config, fallbackResponse: e.target.value })
          }
          rows={3}
          className="w-full rounded-lg border border-propnex-border bg-propnex-bg px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
