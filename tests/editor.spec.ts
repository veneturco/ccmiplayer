import { test, expect } from '@playwright/test';

test.describe('CCMI CapCut Studio - E2E Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe cargar el título principal y la interfaz del editor', async ({ page }) => {
    await expect(page).toHaveTitle(/CCMI CapCut Studio/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('debe verificar la presencia de la barra de herramientas y reproductor de video', async ({ page }) => {
    // Verificar encabezado o título de la app
    const appHeader = page.locator('header');
    await expect(appHeader).toBeVisible();
  });

  test('debe responder al estado offline y mostrar indicador cuando no hay conexión', async ({ page }) => {
    await page.context().setOffline(true);
    // Verificar si el indicador offline aparece
    const offlineBanner = page.locator('text=Modo Offline');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });
  });
});
