import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erro fatal ao renderizar o app:", error);
  rootElement.innerHTML = `
    <div style="color: white; background: #050510; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 20px; text-align: center;">
      <h1 style="color: #00f3ff;">Ops! Algo deu errado.</h1>
      <p style="color: #888;">O aplicativo não conseguiu carregar. Verifique o console para mais detalhes.</p>
      <div style="margin-top: 20px; padding: 15px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; max-width: 500px; font-size: 12px; font-family: monospace; word-break: break-all;">
        ${error instanceof Error ? error.message : 'Erro desconhecido'}
      </div>
      <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #00f3ff; color: black; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
        Recarregar Página
      </button>
    </div>
  `;
}
