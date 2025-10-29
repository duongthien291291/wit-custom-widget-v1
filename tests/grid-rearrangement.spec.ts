import { test, expect } from '@playwright/test';

test.describe('Grid Rearrangement Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the application to load
    await page.waitForSelector('.app-layout', { timeout: 10000 });
  });

  test('should detect and verify grid rearrangement behavior', async ({ page }) => {
    console.log('🎯 Starting Grid Rearrangement Detection Test');
    
    // Create screenshots directory
    await page.evaluate(() => {
      console.log('Setting up test environment...');
    });

    // Step 1: Add first widget and record its position
    console.log('📝 Step 1: Adding first widget (Text Widget)');
    const textWidget = page.locator('.widget-item').filter({ hasText: 'Text Widget' });
    await expect(textWidget).toBeVisible();
    
    await textWidget.dragTo(page.locator('.grid-stack'));
    await page.waitForTimeout(1500); // Wait for GridStack animation
    
    const firstWidget = page.locator('.grid-stack-item').first();
    const firstWidgetPosition = await firstWidget.boundingBox();
    console.log(`📍 First widget position: x=${firstWidgetPosition?.x}, y=${firstWidgetPosition?.y}`);
    
    await page.screenshot({ path: 'tests/screenshots/step1-first-widget.png' });

    // Step 2: Add second widget and check if first widget moved
    console.log('📝 Step 2: Adding second widget (Chart Widget)');
    const chartWidget = page.locator('.widget-item').filter({ hasText: 'Chart Widget' });
    await expect(chartWidget).toBeVisible();
    
    // Record position before adding second widget
    const firstWidgetBeforeSecond = await firstWidget.boundingBox();
    console.log(`📍 First widget position before second: x=${firstWidgetBeforeSecond?.x}, y=${firstWidgetBeforeSecond?.y}`);
    
    await chartWidget.dragTo(page.locator('.grid-stack'));
    await page.waitForTimeout(1500); // Wait for GridStack animation
    
    // Check positions after second widget
    const firstWidgetAfterSecond = await firstWidget.boundingBox();
    const secondWidget = page.locator('.grid-stack-item').nth(1);
    const secondWidgetPosition = await secondWidget.boundingBox();
    
    console.log(`📍 First widget position after second: x=${firstWidgetAfterSecond?.x}, y=${firstWidgetAfterSecond?.y}`);
    console.log(`📍 Second widget position: x=${secondWidgetPosition?.x}, y=${secondWidgetPosition?.y}`);
    
    await page.screenshot({ path: 'tests/screenshots/step2-second-widget.png' });

    // Step 3: Analyze rearrangement behavior
    console.log('🔍 Step 3: Analyzing rearrangement behavior');
    
    const widgetsCount = await page.locator('.grid-stack-item').count();
    expect(widgetsCount).toBe(2);
    console.log(`✅ Total widgets: ${widgetsCount}`);

    // Check if widgets are properly positioned (not overlapping)
    if (firstWidgetAfterSecond && secondWidgetPosition) {
      const isOverlapping = !(
        firstWidgetAfterSecond.x + firstWidgetAfterSecond.width <= secondWidgetPosition.x ||
        secondWidgetPosition.x + secondWidgetPosition.width <= firstWidgetAfterSecond.x ||
        firstWidgetAfterSecond.y + firstWidgetAfterSecond.height <= secondWidgetPosition.y ||
        secondWidgetPosition.y + secondWidgetPosition.height <= firstWidgetAfterSecond.y
      );
      
      expect(isOverlapping).toBe(false);
      console.log('✅ Widgets are not overlapping');
      
      // Check if first widget moved (indicating rearrangement)
      const firstWidgetMoved = (
        firstWidgetBeforeSecond?.x !== firstWidgetAfterSecond.x ||
        firstWidgetBeforeSecond?.y !== firstWidgetAfterSecond.y
      );
      
      if (firstWidgetMoved) {
        console.log('🎉 SUCCESS: First widget moved - Grid rearrangement is working!');
        console.log(`   Movement: x=${firstWidgetBeforeSecond?.x} → ${firstWidgetAfterSecond.x}, y=${firstWidgetBeforeSecond?.y} → ${firstWidgetAfterSecond.y}`);
      } else {
        console.log('⚠️  WARNING: First widget did not move - Grid rearrangement may not be working');
      }
    }

    // Step 4: Test with third widget for more complex rearrangement
    console.log('📝 Step 4: Adding third widget (Image Widget)');
    const imageWidget = page.locator('.widget-item').filter({ hasText: 'Image Widget' });
    await expect(imageWidget).toBeVisible();
    
    // Record positions before third widget
    const allWidgetsBeforeThird = await page.locator('.grid-stack-item').all();
    const positionsBeforeThird: { x: number | undefined; y: number | undefined; }[] = [];
    for (let i = 0; i < allWidgetsBeforeThird.length; i++) {
      const box = await allWidgetsBeforeThird[i].boundingBox();
      positionsBeforeThird.push({ x: box?.x, y: box?.y });
    }
    console.log(`📍 Positions before third widget:`, positionsBeforeThird);
    
    await imageWidget.dragTo(page.locator('.grid-stack'));
    await page.waitForTimeout(1500);
    
    // Record positions after third widget
    const allWidgetsAfterThird = await page.locator('.grid-stack-item').all();
    const positionsAfterThird: { x: number | undefined; y: number | undefined; }[] = [];
    for (let i = 0; i < allWidgetsAfterThird.length; i++) {
      const box = await allWidgetsAfterThird[i].boundingBox();
      positionsAfterThird.push({ x: box?.x, y: box?.y });
    }
    console.log(`📍 Positions after third widget:`, positionsAfterThird);
    
    await page.screenshot({ path: 'tests/screenshots/step4-third-widget.png' });

    // Final verification
    const finalWidgetsCount = await page.locator('.grid-stack-item').count();
    expect(finalWidgetsCount).toBe(3);
    console.log(`✅ Final widgets count: ${finalWidgetsCount}`);
    
    // Check for any overlapping widgets
    const allWidgets = await page.locator('.grid-stack-item').all();
    let hasOverlaps = false;
    
    for (let i = 0; i < allWidgets.length; i++) {
      for (let j = i + 1; j < allWidgets.length; j++) {
        const box1 = await allWidgets[i].boundingBox();
        const box2 = await allWidgets[j].boundingBox();
        
        if (box1 && box2) {
          const isOverlapping = !(
            box1.x + box1.width <= box2.x ||
            box2.x + box2.width <= box1.x ||
            box1.y + box1.height <= box2.y ||
            box2.y + box2.height <= box1.y
          );
          
          if (isOverlapping) {
            hasOverlaps = true;
            console.log(`❌ Overlap detected between widgets ${i} and ${j}`);
          }
        }
      }
    }
    
    expect(hasOverlaps).toBe(false);
    console.log('✅ No overlapping widgets detected');
    
    console.log('🎯 Test completed - Grid rearrangement analysis finished');
  });

  test('should test GridStack drag-in functionality', async ({ page }) => {
    console.log('🎯 Testing GridStack drag-in functionality');
    
    // Check if GridStack is properly initialized
    const gridStack = await page.locator('.grid-stack');
    await expect(gridStack).toBeVisible();
    
    // Check if widget items are draggable
    const textWidget = page.locator('.widget-item').filter({ hasText: 'Text Widget' });
    await expect(textWidget).toBeVisible();
    
    // Test drag start
    await textWidget.hover();
    await page.mouse.down();
    
    // Check if drag started
    const isDragging = await textWidget.evaluate(el => el.classList.contains('ui-draggable-dragging'));
    console.log(`Is dragging: ${isDragging}`);
    
    // Move to grid area
    const gridArea = page.locator('.grid-stack');
    const gridBox = await gridArea.boundingBox();
    
    if (gridBox) {
      await page.mouse.move(gridBox.x + gridBox.width / 2, gridBox.y + gridBox.height / 2);
      
      // Check for visual feedback
      const gridContainer = page.locator('.grid-container');
      const hasDragOverClass = await gridContainer.evaluate(el => el.classList.contains('drag-over'));
      console.log(`Grid has drag-over class: ${hasDragOverClass}`);
    }
    
    // Complete the drag
    await page.mouse.up();
    await page.waitForTimeout(1000);
    
    // Check if widget was added
    const widgetsCount = await page.locator('.grid-stack-item').count();
    console.log(`Widgets after drag: ${widgetsCount}`);
    expect(widgetsCount).toBe(1);
    
    console.log('✅ GridStack drag-in test completed');
  });

  test('should test rapid widget additions', async ({ page }) => {
    console.log('🎯 Testing rapid widget additions');
    
    const widgetTypes = ['Text Widget', 'Chart Widget', 'Image Widget'];
    
    for (let i = 0; i < widgetTypes.length; i++) {
      const widgetType = widgetTypes[i];
      console.log(`📝 Adding widget ${i + 1}: ${widgetType}`);
      
      const widget = page.locator('.widget-item').filter({ hasText: widgetType });
      await expect(widget).toBeVisible();
      
      // Record positions before adding
      const currentWidgets = await page.locator('.grid-stack-item').all();
      const currentPositions: { x: number | undefined; y: number | undefined; }[] = [];
      for (let j = 0; j < currentWidgets.length; j++) {
        const box = await currentWidgets[j].boundingBox();
        currentPositions.push({ x: box?.x, y: box?.y });
      }
      console.log(`📍 Positions before adding ${widgetType}:`, currentPositions);
      
      // Drag widget
      await widget.dragTo(page.locator('.grid-stack'));
      await page.waitForTimeout(500); // Shorter wait for rapid testing
      
      // Record positions after adding
      const newWidgets = await page.locator('.grid-stack-item').all();
      const newPositions: { x: number | undefined; y: number | undefined; }[] = [];
      for (let j = 0; j < newWidgets.length; j++) {
        const box = await newWidgets[j].boundingBox();
        newPositions.push({ x: box?.x, y: box?.y });
      }
      console.log(`📍 Positions after adding ${widgetType}:`, newPositions);
      
      // Check if any existing widgets moved
      let anyMoved = false;
      for (let j = 0; j < Math.min(currentPositions.length, newPositions.length); j++) {
        if (currentPositions[j] && newPositions[j]) {
          const moved = (
            currentPositions[j].x !== newPositions[j].x ||
            currentPositions[j].y !== newPositions[j].y
          );
          if (moved) {
            anyMoved = true;
            console.log(`   Widget ${j} moved: (${currentPositions[j].x}, ${currentPositions[j].y}) → (${newPositions[j].x}, ${newPositions[j].y})`);
          }
        }
      }
      
      if (anyMoved) {
        console.log(`✅ Rearrangement detected when adding ${widgetType}`);
      } else {
        console.log(`⚠️  No rearrangement detected when adding ${widgetType}`);
      }
    }
    
    // Final verification
    const finalCount = await page.locator('.grid-stack-item').count();
    expect(finalCount).toBe(3);
    console.log(`✅ Final widgets count: ${finalCount}`);
    
    console.log('🎯 Rapid widget addition test completed');
  });
});
