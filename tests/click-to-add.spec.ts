import { test, expect } from '@playwright/test';

test.describe('Click-to-Add Widget Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the application to load
    await page.waitForSelector('.app-layout', { timeout: 10000 });
    
    // Clear any existing widgets to ensure clean test state
    const clearButton = page.locator('button').filter({ hasText: 'Clear All' });
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should add widget by clicking on palette item', async ({ page }) => {
    console.log('🎯 Testing click-to-add functionality');
    
    // Check if the page loaded correctly
    const appLayout = page.locator('.app-layout');
    await expect(appLayout).toBeVisible();
    
    // Check if widget palette is visible
    const widgetPalette = page.locator('.widget-palette');
    await expect(widgetPalette).toBeVisible();
    
    // Check if grid is visible
    const gridStack = page.locator('.grid-stack');
    await expect(gridStack).toBeVisible();
    
    console.log('✅ Page elements loaded correctly');
    
    // Get initial widget count
    const initialWidgets = await page.locator('.grid-stack-item').count();
    console.log(`Initial widgets: ${initialWidgets}`);
    
    // Find a text widget in the palette
    const textWidget = page.locator('.widget-item').filter({ hasText: 'Text Widget' });
    await expect(textWidget).toBeVisible();
    
    console.log('✅ Text widget found in palette');
    
    // Click on the widget to add it
    console.log('🔄 Clicking widget to add...');
    await textWidget.click();
    
    // Wait for the operation to complete
    await page.waitForTimeout(2000);
    
    // Check if widget was added
    const finalWidgets = await page.locator('.grid-stack-item').count();
    console.log(`Final widgets: ${finalWidgets}`);
    
    expect(finalWidgets).toBe(initialWidgets + 1);
    console.log('✅ Widget successfully added to grid');
    
    // Check if the widget is visible in the grid
    const addedWidget = page.locator('.grid-stack-item').first();
    await expect(addedWidget).toBeVisible();
    
    console.log('✅ Widget is visible in the grid');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/click-to-add-success.png' });
    
    console.log('🎯 Test completed successfully');
  });

  test('should add multiple widgets by clicking', async ({ page }) => {
    console.log('🎯 Testing multiple widget additions via click');
    
    const widgetTypes = ['Text Widget', 'Chart Widget', 'Image Widget'];
    
    // Get initial widget count
    const initialCount = await page.locator('.grid-stack-item').count();
    console.log(`📊 Initial widget count: ${initialCount}`);
    
    for (let i = 0; i < widgetTypes.length; i++) {
      const widgetType = widgetTypes[i];
      console.log(`📝 Adding widget ${i + 1}: ${widgetType}`);
      
      const widget = page.locator('.widget-item').filter({ hasText: widgetType });
      await expect(widget).toBeVisible();
      
      // Click widget to add it
      await widget.click();
      await page.waitForTimeout(1000); // Wait between additions
      
      // Check if widget was added
      const currentWidgets = await page.locator('.grid-stack-item').count();
      expect(currentWidgets).toBe(initialCount + i + 1);
      
      console.log(`✅ ${widgetType} added successfully`);
    }
    
    // Final verification
    const finalCount = await page.locator('.grid-stack-item').count();
    expect(finalCount).toBe(initialCount + widgetTypes.length);
    console.log(`✅ All ${finalCount} widgets added successfully`);
    
    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/multiple-click-add.png' });
    
    console.log('🎯 Multiple widget click test completed');
  });

  test('should show unsaved changes indicator', async ({ page }) => {
    console.log('🎯 Testing unsaved changes indicator');
    
    // Add a widget
    const textWidget = page.locator('.widget-item').filter({ hasText: 'Text Widget' });
    await textWidget.click();
    await page.waitForTimeout(1000);
    
    // Check if unsaved changes indicator appears
    const unsavedIndicator = page.locator('text=Unsaved changes');
    await expect(unsavedIndicator).toBeVisible();
    
    console.log('✅ Unsaved changes indicator is visible');
    
    // Check if save button is enabled
    const saveButton = page.locator('button').filter({ hasText: 'Save Dashboard' });
    await expect(saveButton).toBeEnabled();
    
    console.log('✅ Save button is enabled');
    
    // Click save button
    await saveButton.click();
    await page.waitForTimeout(1000);
    
    // Check if unsaved changes indicator disappears
    await expect(unsavedIndicator).not.toBeVisible();
    
    console.log('✅ Unsaved changes indicator disappeared after save');
    
    console.log('🎯 Unsaved changes test completed');
  });
});
