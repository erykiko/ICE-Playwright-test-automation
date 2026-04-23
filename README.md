# Test App - Rails Application with Authentication and Simple Form

A Ruby on Rails application with user authentication (login/registration) and a simple form for creating posts, ready for Playwright testing.

## Features

- User authentication using Devise gem
- User registration and login functionality
- Simple form to create posts (title and content fields)
- Posts are associated with logged-in users
- RESTful routes for posts CRUD operations

## Ruby Version

- Ruby 3.4.8

## System Dependencies

- SQLite3 database
- Node.js (for asset compilation)

## Installation

1. Install dependencies:
```bash
bundle install
```

2. Create and setup the database:
```bash
bundle exec rails db:create
bundle exec rails db:migrate
```

## Running the Application

Start the Rails server:
```bash
bundle exec rails server
```

The application will be available at http://localhost:3000

## Application Routes

- Root path (`/`) - Lists all posts
- `/users/sign_up` - User registration
- `/users/sign_in` - User login
- `/users/sign_out` - User logout
- `/posts/new` - Create a new post (requires authentication)
- `/posts/:id` - View a specific post
- `/posts/:id/edit` - Edit a post (requires authentication)

## Testing with Playwright

This application includes a comprehensive Playwright test suite. The server runs on port 3000 by default.

### Setup Playwright

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Playwright browser:
```bash
npm run install:playwright
```

### Running Playwright Tests

Make sure the Rails server is running:
```bash
bundle exec rails server
```

In a separate terminal, run the Playwright tests:
```bash
npm test
```

### Test Coverage

The Playwright test (`playwright_test.js`) covers:

1. **Navigation** - Verifies the application loads correctly
2. **User Registration** - Tests the sign-up flow with email and password
3. **Post Creation** - Tests creating a new post with title and content
4. **Post Details** - Verifies post details are displayed correctly
5. **Navigation** - Tests navigating back to the posts list
6. **Logout** - Tests the logout functionality
7. **Login** - Tests logging in with existing credentials
8. **Data Persistence** - Verifies posts persist after logout/login

### Test Configuration

The test uses the following configuration (in `playwright_test.js`):
- Base URL: `http://localhost:3000`
- Test user email: `test@example.com`
- Test user password: `password123`
- Test post title: `Test Post Title`
- Test post content: `This is test post content created by Playwright.`

The test runs in headed mode (you can see the browser) and will take a screenshot if a test fails.

## Database Configuration

The application uses SQLite3 for simplicity. Database files are stored in the `storage/` directory:
- `storage/test_app_development.sqlite3` - Development database
- `storage/test_app_test.sqlite3` - Test database
