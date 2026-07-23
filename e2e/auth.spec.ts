import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const HAS_CREDENTIALS = !!(ADMIN_EMAIL && ADMIN_PASSWORD);

test.describe('Authentification', () => {
  test('page de connexion affiche le formulaire', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('redirige vers login pour les pages admin non connectées', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('connexion avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalide@test.com');
    await page.fill('input[type="password"]', 'mauvais-mot-de-passe');
    await page.click('button[type="submit"]');
    const errorLocator = page.locator('[role="alert"], .toast, [class*="error"], text=/Erreur|Invalide|Incorrect/').first();
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
  });

  test('déconnexion depuis l\'admin', async ({ page, skip }) => {
    test.skip(!HAS_CREDENTIALS, 'ADMIN_EMAIL / ADMIN_PASSWORD non définis');
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin', { timeout: 15000 });
    await expect(page.locator('text=Déconnexion')).toBeVisible();
    await page.click('text=Déconnexion');
    await expect(page).toHaveURL(/\/login/);
  });
});
