# Playwright Test Automation for Dify

This project is a tool that uses the Playwright E2E test automation framework to automatically add administrator accounts to the Dify system.
You can register administrators listed in admin_list.csv as Dify administrators.

## Key Features

- Automatic addition of administrator accounts to Dify system
- Bulk management of administrator information via CSV file
- Generation of detailed test reports
- Backup of URLs for Dify user invitations
- Generation of SQL commands for forced user deletion in Dify's PostgreSQL

## Prerequisites

- Node.js (16.x or higher)
- npm (8.x or higher)
- Administrator access to Dify system

## Setup Instructions

1. Clone the repository:
```bash
git clone [repository-url]
cd playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browser:
```bash
npx playwright install msedge
```

4. Prepare configuration files:
```bash
cp .env.example .env
cp admin_list.csv.example admin_list.csv
```

## Configuration Files

### 1. Environment Variables (.env)

Copy `.env.example` to create `.env` and configure the following items:

```ini
BASE_URL=http://localhost          # Dify server base URL
OWNER_EMAIL=hogehoge@gmail.com    # Dify owner's email address
OWNER_PASSWORD=hogehoge           # Dify owner's password
ADMIN_LISTCSV=admin_list.csv     # Administrator list CSV filename
ADMIN_PASSWORD=password          # Default password for administrator accounts
REGISTRATION_URL=registration_url.csv  # Filename for saving registration URLs
REMOVE_SQL=remove_sql.txt       # Filename for user deletion SQL
```

### 2. Administrator List (admin_list.csv)
When running the tool, administrator account information should be listed in the following format:

| Column | Description | Example |
|--------|-------------|---------|
| E-Mail | Administrator's email address | user1@gmail.com |
| name | Administrator's display name | User1 |
| password | Administrator's password | "user1_passwd" |

```csv
E-Mail,name,password
user1@gmail.com,User1,"user1_passwd"
user2@gmail.com,User2,"user2_passwd"
```

### 3. Generated Files

#### registration_url.csv
When the tool is executed, registration URLs generated during administrator account registration are saved:
```csv
E-Mail,registration_url
user1@gmail.com,http://localhost/activate?email=user1%40gmail.com&token=xxxxx
```

#### remove_sql.txt
SQL commands for administrator account deletion are generated:
```sql
delete from accounts WHERE email = 'user1@gmail.com';
```

## Running Tests

### Basic Execution Methods

```bash
# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/AddAdmin2Dify.spec.ts

# Run tests in UI mode
npx playwright test --ui
```

### Test Reports

After test execution, an HTML report is generated in the `playwright-report` directory:
```bash
npx playwright show-report
```

## Project Structure

```
Playwright/
├── tests/                      # Test files
│   ├── AddAdmin2Dify.spec.ts  # Administrator addition script
│   └── example.spec.ts        # Sample test
├── playwright.config.ts        # Playwright configuration
├── .env.example               # Environment variables template
├── .env                       # (Note) Copy .env.example and edit according to your environment
├── admin_list.csv.example     # Administrator account list template
├── admin_list.csv            # Administrator account list
├── registration_url.csv      # Registration URL save file (generated when tool is run)
├── remove_sql.txt            # User deletion SQL file (generated when tool is run)
└── package.json              # Project dependencies
```

## Deleting Administrator Accounts

⚠️ **Important Notes**
- Dify admin interface only supports user deactivation
- Only users without registered data can be deleted
- Deletion may affect data integrity, use with caution

### PostgreSQL Deletion Procedure

1. Access PostgreSQL container:
```bash
docker exec -it docker-db-1 bash
```

2. Connect to database:
```bash
psql -U postgres -d dify
```

3. Check and delete user information:
```sql
-- Check user information
select * from accounts;

-- Delete specific user
delete from accounts WHERE email = 'example@gmail.com';