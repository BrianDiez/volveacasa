import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LayoutPublico, TABS } from './Layouts';
import { URL_BAGAYI } from '../ui/marca';

const montar = (ruta = '/') => render(
  <MemoryRouter initialEntries={[ruta]}>
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route path="*" element={<p>contenido</p>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe('LayoutPublico', () => {
  /*
   * Cinco como máximo: un sexto tab los aprieta a 46 px y rompe el área
   * táctil (bagayí §7, BRIEF §4).
   */
  it('la barra del teléfono tiene cinco tabs, con Publicar al centro', () => {
    montar();
    const barra = screen.getByRole('navigation', { name: 'Navegación principal' });
    const tabs = within(barra).getAllByRole('link');

    expect(tabs).toHaveLength(5);
    expect(TABS.length).toBeLessThanOrEqual(5);
    expect(tabs[2].textContent).toBe('Publicar');
    expect(tabs[2].className).toContain('tab--publicar');
  });

  it('marca el tab de la pantalla en la que se está', () => {
    montar('/mapa');
    const barra = screen.getByRole('navigation', { name: 'Navegación principal' });
    expect(within(barra).getByRole('link', { name: 'Mapa' }).className).toContain('active');
    expect(within(barra).getByRole('link', { name: 'Inicio' }).className).not.toContain('active');
  });

  /* El pie es el retorno de marca: sin UTM no se puede medir (BRIEF §12). */
  it('el pie dice «Un proyecto de bagayí» y lleva a bagayí con UTM', () => {
    montar();
    const pie = screen.getByRole('contentinfo');
    expect(pie.textContent).toContain('Un proyecto de');

    const enlace = within(pie).getByRole('link', { name: /bagayí/ });
    expect(enlace.getAttribute('href')).toBe(URL_BAGAYI);
    expect(URL_BAGAYI).toContain('utm_source=volveacasa');
    expect(URL_BAGAYI).toContain('utm_medium=referral');
    expect(URL_BAGAYI).toContain('utm_campaign=un-proyecto-de-bagayi');
    expect(enlace.getAttribute('rel')).toBe('noopener noreferrer');
  });

  /* Nada de bagayí en el header (BRIEF §4): sólo en el pie. */
  it('bagayí no aparece en el header', () => {
    montar();
    expect(screen.getByRole('banner').textContent).not.toMatch(/bagay/i);
  });
});
