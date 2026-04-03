import { FormEvent, useEffect, useState } from 'react';
import './App.css';

type TokenSettingsResponse = {
  apiToken: string;
  hasToken: boolean;
  updatedAt: string | null;
  settingsDirectory: string;
  settingsFile: string;
};

const apiBaseUrl = (
  import.meta.env.VITE_ATLAS_SETTINGS_API_URL ?? 'http://localhost:3010'
).replace(/\/$/, '');

const tokenEndpoint = `${apiBaseUrl}/api/settings/token`;

function formatSavedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return 'Not saved yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(updatedAt));
}

function App() {
  const [apiToken, setApiToken] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    'Loading saved settings...',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(tokenEndpoint);
        const payload = (await response.json()) as TokenSettingsResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load the saved token.');
        }

        if (cancelled) {
          return;
        }

        setApiToken(payload.apiToken);
        setSavedToken(payload.apiToken);
        setUpdatedAt(payload.updatedAt);
        setStatusMessage(
          payload.hasToken
            ? `Loaded token from ${payload.settingsFile}.`
            : `No token saved yet. Settings will be written into ${payload.settingsDirectory}.`,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load the saved token.',
        );
        setStatusMessage(
          'Start the local settings API to read and write token data.',
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setStatusMessage('Saving token...');

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiToken }),
      });
      const payload = (await response.json()) as TokenSettingsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save the token.');
      }

      setSavedToken(payload.apiToken);
      setUpdatedAt(payload.updatedAt);
      setStatusMessage(`Saved token to ${payload.settingsFile}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save the token.',
      );
      setStatusMessage('The token was not saved.');
    } finally {
      setIsSaving(false);
    }
  }

  const isSaveDisabled =
    isLoading ||
    isSaving ||
    apiToken.trim().length === 0 ||
    apiToken === savedToken;

  return (
    <main className="app-shell">
      <section className="page-copy">
        <p className="eyebrow">Atlas Settings</p>
        <h1>Persist UI configuration in the root settings folder.</h1>
        <p className="summary">
          This page writes your API token into
          <code> settings/api-token.json </code>
          through a small local API, so the web app can store real files instead
          of browser-only state.
        </p>

        <div className="meta-grid">
          <article className="meta-card">
            <p className="card-kicker">Folder</p>
            <h2>settings/</h2>
            <p>
              Reserved for local UI data, config files, and future artifacts.
            </p>
          </article>
          <article className="meta-card">
            <p className="card-kicker">Last Saved</p>
            <h2>{formatSavedAt(updatedAt)}</h2>
            <p>{statusMessage}</p>
          </article>
        </div>
      </section>

      <section className="settings-panel">
        <div className="panel-header">
          <p className="card-kicker">API Token</p>
          <h2>Save a token to disk</h2>
          <p>
            Run the local settings API and submit the form. The token is stored
            in the root workspace, not in browser storage.
          </p>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          <label className="field" htmlFor="api-token">
            <span>API token</span>
            <input
              id="api-token"
              name="apiToken"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              placeholder="Paste your token"
            />
          </label>

          <div className="form-footer">
            <div className="status-block" role="status" aria-live="polite">
              <p>{statusMessage}</p>
              {errorMessage ? (
                <p className="error-text">{errorMessage}</p>
              ) : null}
            </div>

            <button type="submit" disabled={isSaveDisabled}>
              {isSaving ? 'Saving...' : 'Save token'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default App;
