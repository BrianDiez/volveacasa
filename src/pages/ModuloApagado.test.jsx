import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ModuloApagado } from './ModuloApagado';

describe('ModuloApagado', () => {
  it('dice que todavía no está disponible, con el nombre del módulo', () => {
    render(<MemoryRouter><ModuloApagado clave="veterinarias" /></MemoryRouter>);
    expect(screen.getByText('Todavía no está disponible')).toBeTruthy();
    expect(screen.getByText(/Veterinarias/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Ir al inicio' }).getAttribute('href')).toBe('/');
  });
});
