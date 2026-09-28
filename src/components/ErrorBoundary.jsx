import { Component } from 'react';
import { Boton } from '../ui/kit';

/**
 * Red de contención de la app.
 *
 * Sin esto, cualquier excepción en un render deja la pantalla en blanco. El
 * caso más probable no es un bug: es que falle la descarga de un chunk lazy
 * (red inestable, o un deploy nuevo que invalidó el hash del archivo que el
 * navegador tenía referenciado). Por eso el botón principal es recargar.
 */
export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Con un servicio de errores, este es el lugar donde reportarlo.
    console.error('Error no capturado:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    // Un chunk que no carga se ve distinto de un bug: el mensaje lo dice.
    const esChunk = /dynamically imported module|Importing a module script failed|Failed to fetch/i
      .test(error.message ?? '');

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--fondo-canvas)',
      }}>
        <div className="panel" style={{ padding: 26, maxWidth: 460 }}>
          <h1 style={{ fontSize: 20, marginBottom: 10 }}>
            {esChunk ? 'No pudimos cargar esta pantalla' : 'Algo se rompió de nuestro lado'}
          </h1>
          <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--texto)', lineHeight: 1.6 }}>
            {esChunk
              ? 'Puede ser la conexión, o que haya salido una versión nueva mientras navegabas. Recargar suele alcanzar.'
              : 'No es culpa tuya. Si vuelve a pasar, escribinos y contanos qué estabas haciendo.'}
          </p>

          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            <Boton onClick={() => window.location.reload()}>Recargar</Boton>
            <Boton variante="secundario" onClick={() => { window.location.href = '/'; }}>
              Ir al inicio
            </Boton>
          </div>

          {import.meta.env.DEV && (
            <pre style={{
              marginTop: 18, padding: 12, borderRadius: 'var(--r)',
              background: 'var(--gris-suave)', fontSize: 11, lineHeight: 1.5,
              overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap',
            }}>{error.stack ?? String(error)}</pre>
          )}
        </div>
      </div>
    );
  }
}
