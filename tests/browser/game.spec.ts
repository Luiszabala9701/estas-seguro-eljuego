import { test, expect } from '@playwright/test';
import { emptySave } from '../../src/engine/persistence';

for (const sample of [
  { id: 'habitacion-309', title: 'Habitación 309', ending: 'El minuto que faltaba', input: 'En la caldera', category: 'boiler', actions: ['entered', 'pilar-first', 'locate', '@input', 'align', 'blackmail', 'admit-room', 'remember', 'confess-force', 'find-knife', 'defense', 'formal-defense', 'finish'] },
  { id: 'testigo-imposible', title: 'El testigo imposible', ending: 'El archivo respira', input: 'En la cabina', category: 'projection', actions: ['screen', 'similar', '@input', 'elisa', 'original', 'correct-date', 'listen', 'memory', 'admit-hide', 'admit-past', 'name-father', 'full', 'finish'] }
]) {
  test(`caso completo: ${sample.title}`, async ({ page }, info) => {
    const seed = emptySave(); seed.progress.unlocked = ['ultima-llamada', 'habitacion-309', 'testigo-imposible']; seed.settings.instantText = true; seed.settings.reducedMotion = true;
    await page.addInitScript(saved => { localStorage.setItem('estas-seguro.save', JSON.stringify(saved)); }, seed);
    await page.goto('/');
    await page.locator(`[data-action="case"][data-id="${sample.id}"]`).click();
    await page.getByRole('button', { name: 'Iniciar este caso' }).click();
    for (const action of sample.actions) {
      if (action === '@input') {
        await page.getByLabel('Tu declaración', { exact: true }).fill(sample.input);
        await page.getByRole('button', { name: 'Revisar', exact: true }).click();
        await page.locator(`[data-action="input-confirm"][data-id="${sample.category}"]`).click();
      } else await page.locator(`[data-action="answer"][data-id="${action}"]`).click();
      let guard = 0;
      while (await page.locator('[data-action="resolve"][data-id="explain"]').count()) {
        if (++guard > 30) throw new Error('Confrontación atascada');
        await page.locator('[data-action="resolve"][data-id="explain"]').click();
      }
    }
    await expect(page.getByRole('heading', { name: sample.ending, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `output/qa/${sample.id}-${info.project.name}.png`, fullPage: true });
  });
}
test('menú, opciones, teclado, expediente y guardado', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const external: string[] = []; page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:5173') && !r.url().startsWith('data:')) external.push(r.url()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /¿Estás/ })).toBeVisible();
  await expect(page.locator('.case-card')).toHaveCount(3);
  await expect(page.locator('.case-card.locked')).toHaveCount(2);
  await expect(page.locator('body')).not.toHaveClass(/fatal/);
  await page.screenshot({ path: `output/qa/home-${testInfo.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Opciones', exact: true }).click();
  await page.getByLabel('Texto instantáneo').check();
  await page.getByLabel('Reducir movimiento').check();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Entrar a la sala' }).click();
  await expect(page.locator('#speaker')).toHaveText('Inés Salvatierra');
  await page.screenshot({ path: `output/qa/game-${testInfo.project.name}.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('1');
  await page.locator('[data-action="answer"][data-id="yes"]').click();
  await page.getByLabel('Tu declaración', { exact: true }).fill('En casa');
  await page.getByRole('button', { name: 'Revisar', exact: true }).click();
  await page.getByRole('button', { name: 'No, quiero reformular' }).click();
  await expect(page.locator('#interpretation')).toBeEmpty();
  await page.getByLabel('Tu declaración', { exact: true }).fill('No estaba en casa');
  await page.getByRole('button', { name: 'Revisar', exact: true }).click();
  await expect(page.locator('#interpretation')).toContainText('No se registró ninguna declaración');
  await page.locator('[data-action="input-confirm"][data-id="workshop"]').click();
  await page.locator('[data-action="answer"][data-id="admit"]').click();
  await page.keyboard.press('e');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('tab', { name: 'Declaraciones' }).click();
  await expect(page.getByRole('dialog')).toContainText('No estaba en casa');
  await page.keyboard.press('Escape');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar partida' }).click();
  await expect(page.locator('.dialogue-text')).toContainText('La segunda hoja');
  await page.locator('[data-action="answer"][data-id="recorder"]').click();
  await page.locator('[data-action="answer"][data-id="open"]').click();
  await page.locator('[data-action="answer"][data-id="hold"]').click();
  await page.keyboard.press('e');
  await page.getByRole('tab', { name: 'Pruebas', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: /La tarjeta bajo la cinta/ }).click();
  await expect(page.getByRole('dialog')).toContainText('TARJETA 4 GB');
  await page.getByRole('button', { name: 'Presentar prueba' }).click();
  await expect(page.locator('.reaction')).toContainText('Estas firmas justifican');
  await page.locator('[data-action="answer"][data-id="trust"]').click();
  await page.locator('[data-action="answer"][data-id="find"]').click();
  await page.locator('[data-action="answer"][data-id="safe"]').click();
  await page.locator('[data-action="answer"][data-id="finish"]').click();
  await expect(page.getByRole('heading', { name: 'Al otro lado del amanecer' })).toBeVisible();
  await page.screenshot({ path: `output/qa/ending-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Volver a los casos' }).click();
  await expect(page.locator('.case-card.locked')).toHaveCount(1);
  await page.getByRole('button', { name: 'Archivo', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Al otro lado del amanecer');
  await expect(page.getByRole('dialog')).not.toContainText('Una línea que nadie atiende');
  expect(errors).toEqual([]); expect(external).toEqual([]);
});
test('mentira, confrontación, rectificación y recuperación exacta', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Entrar a la sala' }).click();
  await page.locator('[data-action="answer"][data-id="stranger"]').click();
  await page.locator('[data-action="answer"][data-id="yes"]').click();
  await expect(page.locator('.conflict-label')).toContainText('NO ENCAJA');
  await page.locator('[data-action="resolve"][data-id="rectify"]').click();
  await expect(page.locator('.conflict-label')).toHaveCount(0);
  await page.getByLabel('Tu declaración', { exact: true }).fill('en mi casa');
  await page.getByRole('button', { name: 'Revisar', exact: true }).click();
  await page.locator('[data-action="input-confirm"][data-id="home"]').click();
  await page.locator('[data-action="answer"][data-id="deny"]').click();
  await expect(page.locator('.conflict-label')).toBeVisible();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('estas-seguro.save')!).game);
  await page.reload(); await page.getByRole('button', { name: 'Continuar partida' }).click();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('estas-seguro.save')!).game);
  expect(after).toEqual(before);
  await expect(page.locator('.conflict-label')).toBeVisible();
  await page.locator('[data-action="resolve"][data-id="explain"]').click();
  await page.locator('[data-action="resolve"][data-id="silence"]').click();
  await expect(page.locator('.conflict-label')).toHaveCount(0);
});
test('reinicio pide confirmación; controles, foco y volumen funcionan', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Entrar a la sala' }).click();
  await page.locator('[data-action="answer"][data-id="friend"]').click();
  await page.locator('.brand').click(); await page.getByRole('button', { name: 'Nueva partida', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Hay una partida en curso');
  await page.getByRole('button', { name: 'Seguir con mi partida' }).click();
  await page.getByRole('button', { name: 'Opciones', exact: true }).click();
  await page.getByLabel('Sonido ambiental').check();
  await page.getByRole('slider', { name: 'Volumen' }).press('Home');
  await page.getByRole('slider', { name: 'Volumen' }).press('ArrowRight');
  await page.getByRole('slider', { name: 'Volumen' }).press('ArrowRight');
  await page.getByLabel('Indicadores narrativos').check();
  await page.getByLabel('Tamaño del texto').selectOption('large');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('estas-seguro.save')!).settings.volume)).toBe(2);
  await page.getByRole('button', { name: 'Borrar todos los datos', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('no se puede deshacer');
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button', { name: 'Continuar partida' }).click();
  await expect(page.locator('.dialogue-text')).toContainText('alguien llamó');
  await expect(page.locator('html')).toHaveClass(/large-text/);
});
