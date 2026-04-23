const { chromium } = require('playwright');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  password_confirmation: 'password123'
};

const TEST_POST = {
  title: `Test Post Title ${Date.now()}`,
  content: 'This is test post content created by Playwright.'
};

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Starting Playwright tests...\n');

    // Test 1: Navigate to the application
    console.log('Test 1: Navigate to application');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    console.log('✓ Application loaded successfully\n');

    // Test 2: User Registration
    console.log('Test 2: User Registration');
    await page.waitForSelector('text=Sign up', { timeout: 5000 });
    await page.click('text=Sign up');
    await page.waitForURL('**/users/sign_up', { timeout: 5000 });
    
    await page.waitForSelector('input[name="user[email]"]', { timeout: 5000 });
    await page.fill('input[name="user[email]"]', TEST_USER.email);
    await page.fill('input[name="user[password]"]', TEST_USER.password);
    await page.fill('input[name="user[password_confirmation]"]', TEST_USER.password_confirmation);
    
    await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/', { timeout: 5000 });
    console.log('✓ User registered successfully\n');

    // Test 3: Create a Post
    console.log('Test 3: Create a Post');
    await page.waitForSelector('text=New Post', { timeout: 5000 });
    await page.click('text=New Post');
    await page.waitForURL('**/posts/new', { timeout: 5000 });
    
    await page.waitForSelector('input[name="post[title]"]', { timeout: 5000 });
    await page.fill('input[name="post[title]"]', TEST_POST.title);
    await page.fill('textarea[name="post[content]"]', TEST_POST.content);
    
    await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/posts/**', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    
    const postCreated = await page.locator(`text=${TEST_POST.title}`).isVisible();
    if (postCreated) {
      console.log('✓ Post created successfully\n');
    } else {
      throw new Error('Post creation failed');
    }

    // Test 4: View Post Details
    console.log('Test 4: View Post Details');
    await page.waitForLoadState('networkidle');
    
    const titleText = await page.locator('text=Title:').isVisible();
    const contentText = await page.locator('text=Content:').isVisible();
    const postTitleVisible = await page.locator(`text=${TEST_POST.title}`).isVisible();
    const postContentVisible = await page.locator(`text=${TEST_POST.content}`).isVisible();
    
    if (titleText && contentText && postTitleVisible && postContentVisible) {
      console.log('✓ Post details displayed correctly\n');
    } else {
      throw new Error('Post details not displayed correctly');
    }

    // Test 5: Navigate back to posts list
    console.log('Test 5: Navigate back to posts list');
    await page.waitForSelector('text=Back to posts', { timeout: 5000 });
    await page.click('text=Back to posts');
    await page.waitForURL('**/posts', { timeout: 5000 });
    console.log('✓ Navigated back to posts list\n');

    // Test 6: Logout
    console.log('Test 6: Logout');
    await page.waitForSelector('button:has-text("Logout")', { timeout: 5000 });
    await page.click('button:has-text("Logout")');
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    
    // Verify we're logged out by checking for Login link
    await page.waitForSelector('text=Login', { timeout: 5000 });
    console.log('✓ User logged out successfully\n');

    // Test 7: Login with existing user
    console.log('Test 7: Login with existing user');
    await page.waitForSelector('text=Login', { timeout: 5000 });
    await page.click('text=Login');
    await page.waitForURL('**/users/sign_in', { timeout: 5000 });
    
    await page.waitForSelector('input[name="user[email]"]', { timeout: 5000 });
    await page.fill('input[name="user[email]"]', TEST_USER.email);
    await page.fill('input[name="user[password]"]', TEST_USER.password);
    
    await page.waitForSelector('input[type="submit"]', { timeout: 5000 });
    await page.click('input[type="submit"]');
    
    await page.waitForURL('**/', { timeout: 5000 });
    console.log('✓ User logged in successfully\n');

    // Test 8: Verify post still exists after re-login
    console.log('Test 8: Verify post still exists after re-login');
    await page.waitForLoadState('networkidle');
    const postVisible = await page.locator(`text=${TEST_POST.title}`).isVisible();
    if (postVisible) {
      console.log('✓ Post still exists after re-login\n');
    } else {
      throw new Error('Post not found after re-login');
    }

    console.log('All tests passed! ✓');

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'test-failure.png' });
    console.error('Screenshot saved as test-failure.png');
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests().catch(console.error);
