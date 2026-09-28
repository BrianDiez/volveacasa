import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

/*
 * Desmontar lo renderizado después de cada test.
 *
 * Testing Library trae limpieza automática, pero se engancha a un `afterEach`
 * GLOBAL, y acá `globals` está en false —los 19 tests de Node importan `test` y
 * `expect` a mano, y no vale la pena romper esa convención por esto—. Sin
 * globals, RTL no encuentra dónde engancharse y no limpia nada, sin avisar.
 *
 * Lo que se ve cuando falta es un `getByText` que revienta con "found multiple
 * elements" en un test que no tiene nada que ver, como si el componente se
 * montara dos veces. Está medido: sin esta línea, dos renders del mismo
 * componente dejan `[ <p></p>, <p></p> ]` en el body.
 */
afterEach(cleanup);
