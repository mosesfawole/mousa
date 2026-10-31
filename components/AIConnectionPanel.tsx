"use client";
import { useRef, useState } from "react";
import { KeyRound, X, ArrowUpRight, ShieldCheck, Unplug } from "lucide-react";
import { useAIConnection } from "@/store/useAIConnection";
import { AI_PROVIDERS, type AIProvider } from "@/lib/ai-config";

export default function AIConnectionPanel({ busy }: { busy: boolean }) {
  const connection = useAIConnection();
  const dialog = useRef<HTMLDialogElement>(null);
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const config = AI_PROVIDERS[provider];

  function close() {
    setKey("");
    setError("");
    dialog.current?.close();
  }
  function open() {
    setProvider(connection.provider);
    setKey("");
    setError("");
    setNotice("");
    dialog.current?.showModal();
  }
  function connect(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!connection.connect(provider, key)) {
      setError(
        `This doesn’t look like a valid ${config.name} API key. Check the provider and paste the full key.`,
      );
      return;
    }
    close();
    setNotice(
      `${config.name} key added for this tab. Generate new ideas to use live writing.`,
    );
  }
  return (
    <>
      <button className="btn ai-connect-button" onClick={open} disabled={busy}>
        <KeyRound size={13} />
        {connection.apiKey ? "AI settings" : "Connect your AI"}
      </button>
      <span className="sr-only" role="status">
        {notice}
      </span>
      <dialog
        ref={dialog}
        className="ai-dialog"
        aria-labelledby="ai-title"
        aria-describedby="ai-description"
        onCancel={() => {
          setKey("");
          setError("");
        }}
        onClose={() => setKey("")}
      >
        <div className="ai-dialog-heading">
          <span className="eyebrow">A LITTLE MORE MOMENTUM</span>
          <button
            className="ai-close"
            onClick={close}
            aria-label="Close AI settings"
          >
            <X size={18} />
          </button>
        </div>
        <h2 id="ai-title" className="serif">
          Your key. Your writing room.
        </h2>
        <p id="ai-description" className="ai-description">
          Connect your own AI account for live ideas, drafts, and reviews. The
          sample studio is always available.
        </p>
        {connection.apiKey && (
          <div className="ai-current">
            <div>
              <strong>
                {AI_PROVIDERS[connection.provider].name} key added
              </strong>
              <p>
                Available in this tab only. Verified when you make a live
                request.
              </p>
            </div>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => {
                connection.disconnect();
                setKey("");
                setError("");
                setNotice("API key disconnected. You’re back in sample mode.");
                close();
              }}
            >
              <Unplug size={13} /> Disconnect
            </button>
          </div>
        )}
        <form onSubmit={connect} aria-label="Connect an AI provider">
          <div className="field">
            <label htmlFor="ai-provider">Your AI provider</label>
            <select
              id="ai-provider"
              className="mousa-input"
              value={provider}
              onChange={(event) => {
                setProvider(event.target.value as AIProvider);
                setKey("");
                setError("");
              }}
              disabled={busy}
            >
              <option value="anthropic">Anthropic · Claude</option>
              <option value="openai">OpenAI · GPT</option>
            </select>
            <span className="field-help">
              Live writing uses {config.modelName}.
            </span>
          </div>
          <div className="field">
            <label htmlFor="ai-key">{config.name} API key</label>
            <input
              id="ai-key"
              className="mousa-input"
              type="password"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setError("");
              }}
              placeholder={provider === "anthropic" ? "sk-ant-…" : "sk-…"}
              autoComplete="off"
              spellCheck={false}
              autoCapitalize="none"
              maxLength={512}
              required
              disabled={busy}
              aria-describedby="ai-key-help"
            />
            <span id="ai-key-help" className="field-help">
              {connection.apiKey
                ? "Paste a new key to replace the current connection. "
                : ""}
              <a href={config.keyUrl} target="_blank" rel="noreferrer">
                Get your {config.name} API key <ArrowUpRight size={11} />
              </a>
            </span>
          </div>
          <div className="ai-privacy">
            <ShieldCheck size={17} />
            <div>
              <strong>Only for this tab</strong>
              <p>
                Your key stays in tab memory and clears on reload or Disconnect.
                For live requests, it passes securely through Mousa to{" "}
                {config.name}. Mousa doesn’t save it to browser storage or its
                database.
              </p>
            </div>
          </div>
          <p className="ai-billing">
            {config.name} bills API usage to your account. A ChatGPT or Claude
            subscription doesn’t include API credit. Adding a key makes no AI
            request; generating ideas, drafting, and reviewing use your API
            allowance.
          </p>
          {error && (
            <p className="error-box" role="alert">
              {error}
            </p>
          )}
          <div className="ai-dialog-actions">
            <button className="btn btn-violet" disabled={busy || !key.trim()}>
              <KeyRound size={13} /> Use my key
            </button>
            <button type="button" className="btn btn-quiet" onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
