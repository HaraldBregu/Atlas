import './App.css';

const capabilityCards = [
  {
    title: 'Agent Graph',
    description:
      'Coordinate orchestrators and specialists through a UI that can surface graph state and execution handoffs.',
  },
  {
    title: 'Tooling',
    description:
      'Expose MCP capabilities, internal tools, and execution traces without coupling UI code to runtime internals.',
  },
  {
    title: 'Durable State',
    description:
      'Present history, checkpoints, and retrieved context in a browser workflow built for inspection and iteration.',
  },
];

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Atlas UI</p>
        <h1>React + TypeScript entrypoint for the Atlas web app.</h1>
        <p className="summary">
          This `ui/` folder is a standalone frontend workspace. It is ready for
          routes, chat surfaces, tool panels, and whatever browser experience
          Atlas grows into next.
        </p>
        <div className="hero-actions">
          <a href="https://react.dev" target="_blank" rel="noreferrer">
            React docs
          </a>
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
            Vite docs
          </a>
        </div>
      </section>

      <section className="capability-grid">
        {capabilityCards.map((card) => (
          <article className="capability-card" key={card.title}>
            <p className="card-kicker">Foundation</p>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
