import { test, expect } from '@playwright/test';
test('la compilación funciona tras cortar la conexión y restaurar una partida', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  expect(errors).toEqual([]);
  await expect(page.getByRole('heading', { name: /¿Estás/ })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar a la sala' }).click();
  await page.locator('[data-action="answer"][data-id="friend"]').click();
  await page.reload();
  await page.getByRole('button', { name: 'Continuar partida' }).click();
  await page.getByRole('button', { name: 'Mostrar texto' }).click();
  await expect(page.locator('.dialogue-text')).toContainText('alguien llamó');
  expect(errors).toEqual([]);
});
