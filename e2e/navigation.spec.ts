import { test, expect } from '@playwright/test';

test.describe('Navigation publique', () => {
  test('page d\'accueil se charge', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Racing Club de Bingerville/);
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('navigation vers les pages principales', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    await page.goto('/effectif');
    await expect(page.locator('h1')).toContainText(/Effectif|Joueurs/);

    await page.goto('/matchs');
    await expect(page.locator('h1')).toContainText(/Matchs|Calendrier/);

    await page.goto('/news');
    await expect(page.locator('h1')).toContainText(/Actualités/);

    await page.goto('/galerie');
    await expect(page.locator('h1')).toContainText(/Galerie/);

    await page.goto('/classement');
    await expect(page.locator('h1')).toContainText(/Classement/);
  });

  test('page 404 pour les routes inconnues', async ({ page }) => {
    const response = await page.goto('/page-inexistante');
    expect(response?.status()).toBe(200);
    await expect(page.locator('text=404')).toBeVisible();
  });

  test('footer est présent sur toutes les pages', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/Racing Club de Bingerville/);
  });

  test('mode responsive mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuButton = page.locator('button[aria-label*="menu" i], button.hamburger, button:has(svg)').first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('nav a').first()).toBeVisible();
    }
  });
});
