import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';

// .envファイルを読み込む
dotenv.config();

test('test', async ({ page }) => {
  // 初期化：registration_urlのCSVファイルを作成（ヘッダーのみ）
  // 登録ミス時の登録URL一覧ファイル
  const registrationUrlFile = process.env.REGISTRATION_URL || 'registration_url.csv';
  fs.writeFileSync(registrationUrlFile, 'E-Mail,registration_url\n');
  // Postgrasqlユーザ削除コマンドファイル
  //
  // docker exec -iu docker-db-1 bash
  // psql -U postgres -d dify
  // \d
  // select * from accounts;
  // delete from accounts WHERE email = 'portfolio997@gmail.com';
  // 
  const removeSqlFile = process.env.REMOVE_SQL || 'remove_sql.txt';
  fs.writeFileSync(removeSqlFile, '-- PostgreSQL delete commands\n');
  

  // CSVファイルを読み込む
  const csvFilePath = process.env.ADMIN_LISTCSV || 'admin_list.csv';
  const csvContent = fs.readFileSync(csvFilePath);
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  // ブラウザを開く
  await page.goto(`${process.env.BASE_URL}/signin`);
  // 言語を日本語に設定
  await page.getByRole('button', { name: 'English (United States)' }).click();
  await page.getByRole('menuitem', { name: '日本語 (日本)' }).click();
    
  // 各レコードに対して処理を実行
  for (const record of records) {
    const adminEmail = record['E-Mail']; // CSVファイルのE-Mailカラムを使用
    const adminPassword = record['password'] || process.env.ADMIN_PASSWORD || ''; // CSVファイルのpasswordカラムを使用、空の場合は環境変数を使用

    // 既存の管理者アカウントでサインイン
    await page.goto(`${process.env.BASE_URL}/signin`);
//    await page.getByRole('button', { name: 'English (United States)' }).click();
//    await page.getByRole('menuitem', { name: '日本語 (日本)' }).click();
    // 所有者のアカウント(メールアドレス)を入力
    await page.getByRole('textbox', { name: 'メールアドレス' }).click();
    await page.getByRole('textbox', { name: 'メールアドレス' }).fill(process.env.OWNER_EMAIL || '');
    // 所有者のパスワードを入力
    await page.getByRole('textbox', { name: 'メールアドレス' }).press('Tab');
    await page.getByRole('textbox', { name: 'パスワード パスワードをお忘れですか？' }).fill(process.env.OWNER_PASSWORD || '');
    await page.getByRole('textbox', { name: 'パスワード パスワードをお忘れですか？' }).press('Enter');
    // サインイン後、アカウント設定画面に遷移するのを待つ
    // ここでは'D'ボタンを待っているが、これはアカウント作成時に'Dify'という名前でアカウントを作成したため
    // 'D'となっているアカウント名によって変更する必要があるので注意すること
    await page.getByRole('button', { name: 'D', exact: true }).click();
    // 管理者アプリの設定画面に移動
    await page.getByText('設定').click();
    // 管理者の招待をクリック
    await page.getByRole('button', { name: '招待' }).click();
    // 管理者の招待メールの入力
    await page.getByText('メールを入力してください').click();
    await page.getByRole('textbox').fill(adminEmail);
    await page.getByText('通常ユーザーとして招待されました').click();
    await page.locator('div').filter({ hasText: /^管理者アプリの構築およびチーム設定の管理ができます$/ }).first().click();
    await page.getByRole('button', { name: '招待を送る' }).click();
    // 招待URLの取得
    const url = await page.locator('div.text-text-primary[data-state="closed"]').textContent();
    // 招待URLをCSVファイルに保存
    fs.appendFileSync(process.env.REGISTRATION_URL || 'registration_url.csv', `${adminEmail},${process.env.BASE_URL}${url}\n`);
    // ユーザ削除用のPostgresqlコマンドをファイルに保存
    fs.appendFileSync(removeSqlFile, `delete from accounts WHERE email = '${adminEmail}';\n`);
    // 招待URLにアクセス
    await page.goto(`${process.env.BASE_URL}${url}`);
    // 招待URLにアクセスした後、パスワードを入力
    await page.locator('input[type="password"]').click();
    // パスワードを入力
    await page.locator('input[type="password"]').fill(adminPassword);
    // パスワードを入力後、Enterキーを押す
    await page.getByRole('button', { name: 'サインイン' }).click();
    // サインイン後、アカウント設定画面に遷移するのを待つ
    await page.waitForTimeout(1000);
  }

  await page.close();
});