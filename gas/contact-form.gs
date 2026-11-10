/**
 * ============================================
 * NT Partner Support — Contact Form Backend
 * Google Apps Script (GAS) Web App
 * ============================================
 * 
 * 【セットアップ手順】
 * 1. Google Drive で新しいスプレッドシートを作成
 *    → シート名を「お問い合わせ」に変更
 * 2. Apps Script エディタを開く（拡張機能 → Apps Script）
 * 3. このコードを貼り付け
 * 4. 定数 SHEET_NAME, NOTIFY_EMAIL を確認・修正
 * 5. デプロイ → 新しいデプロイ → ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセスできるユーザー: 全員
 * 6. 生成されたURLを contact.html の GAS_ENDPOINT にセット
 */

// ─── 設定 ───
const SHEET_NAME = 'お問い合わせ';
const NOTIFY_EMAIL = 'n.sec.20210715@gmail.com';
const COMPANY_NAME = '株式会社 NT Partner Support';

/**
 * GET リクエスト — ヘルスチェック用
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'NT Partner Support Contact API' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST リクエスト — フォーム受信
 */
function doPost(e) {
  try {
    // リクエストボディをパース
    const data = JSON.parse(e.postData.contents);

    // スプレッドシートに記録
    saveToSheet(data);

    // 通知メール送信
    sendNotificationEmail(data);

    // 自動返信メール送信
    sendAutoReplyEmail(data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'お問い合わせを受け付けました' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('doPost Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * スプレッドシートにデータを保存
 */
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // ヘッダー行を追加
    sheet.appendRow([
      '受信日時',
      '姓',
      '名',
      '会社名',
      'メール',
      '電話番号',
      'サービス',
      '詳細・ご要望',
      'ステータス'
    ]);
    // ヘッダーの書式設定
    const headerRange = sheet.getRange(1, 1, 1, 9);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a1a2e');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  // サービス名の日本語変換
  const serviceMap = {
    'executive-protection': '身辺警護',
    'airport-vip': '福岡空港VIP警護',
    'secure-transport': '車両移動警護',
    'venue-security': '施設・イベント警備',
    'consulting': 'セキュリティコンサルティング',
    'other': 'その他'
  };

  const serviceName = serviceMap[data.service] || data.service || '';

  // データ行を追加
  sheet.appendRow([
    new Date(),
    data.lastName || '',
    data.firstName || '',
    data.company || '',
    data.email || '',
    data.phone || '',
    serviceName,
    data.message || '',
    '未対応'
  ]);

  // 列幅を自動調整
  sheet.autoResizeColumns(1, 9);
}

/**
 * 管理者への通知メール
 */
function sendNotificationEmail(data) {
  const serviceMap = {
    'executive-protection': '身辺警護 / Executive Protection',
    'airport-vip': '福岡空港VIP警護 / Secure Arrival',
    'secure-transport': '車両移動警護 / Secure Transport',
    'venue-security': '施設・イベント警備 / Venue Security',
    'consulting': 'セキュリティコンサルティング',
    'other': 'その他'
  };

  const serviceName = serviceMap[data.service] || data.service || '未選択';
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  const subject = `【お問い合わせ】${data.lastName || ''} ${data.firstName || ''} 様 — ${serviceName}`;

  const body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  新しいお問い合わせがありました
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

受信日時: ${timestamp}

■ お客様情報
  お名前: ${data.lastName || ''} ${data.firstName || ''}
  会社名: ${data.company || '(個人)'}
  メール: ${data.email || ''}
  電話番号: ${data.phone || '(未入力)'}

■ ご相談内容
  サービス: ${serviceName}

■ 詳細・ご要望
${data.message || '(未入力)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${COMPANY_NAME}
  https://ntps-security.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body, {
    name: COMPANY_NAME + ' Webサイト',
    replyTo: data.email || NOTIFY_EMAIL
  });
}

/**
 * お客様への自動返信メール
 */
function sendAutoReplyEmail(data) {
  if (!data.email) return;

  const serviceMap = {
    'executive-protection': '身辺警護 / Executive Protection',
    'airport-vip': '福岡空港VIP警護 / Secure Arrival',
    'secure-transport': '車両移動警護 / Secure Transport',
    'venue-security': '施設・イベント警備 / Venue Security',
    'consulting': 'セキュリティコンサルティング',
    'other': 'その他'
  };

  const serviceName = serviceMap[data.service] || data.service || '';

  const subject = `【自動返信】お問い合わせありがとうございます — ${COMPANY_NAME}`;

  const body = `
${data.lastName || ''} ${data.firstName || ''} 様

この度はお問い合わせいただき、誠にありがとうございます。
以下の内容で承りました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  お名前: ${data.lastName || ''} ${data.firstName || ''}
  会社名: ${data.company || '(個人)'}
  サービス: ${serviceName}
  
  詳細・ご要望:
  ${data.message || '(未入力)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

担当者より、通常24時間以内にご連絡差し上げます。
お急ぎの場合は、お電話にてご連絡ください。

なお、このメールは自動送信されております。
このメールへの返信はお控えくださいますようお願いいたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ${COMPANY_NAME}
  代表取締役 高橋 直己

  Web: https://ntps-security.com
  Mail: ${NOTIFY_EMAIL}
  
  〒 福岡県福岡市中央区赤坂一丁目8-23 5F
  営業時間: 24時間対応
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  GmailApp.sendEmail(data.email, subject, body, {
    name: COMPANY_NAME,
    replyTo: NOTIFY_EMAIL
  });
}

/**
 * ─── テスト関数 ───
 * スクリプトエディタで実行してテスト可能
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        lastName: 'テスト',
        firstName: '太郎',
        company: 'テスト株式会社',
        email: 'test@example.com',
        phone: '090-1234-5678',
        service: 'executive-protection',
        message: 'テスト送信です。'
      })
    }
  };

  const result = doPost(testData);
  console.log(result.getContent());
}
