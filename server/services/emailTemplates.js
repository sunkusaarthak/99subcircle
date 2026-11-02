/**
 * 99subcircle Minimal Black & White Responsive HTML Email Templates
 */

function getPayerReminderTemplate({ groupName, platform, amount, currency, payerName, adminName, adminEmail, paymentDetails, cycleMonth, dueDate }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${groupName} — 99subcircle Payment Notice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 32px 16px; color: #18181b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .header { padding: 28px 24px 20px 24px; border-bottom: 1px solid #f4f4f5; }
    .brand { font-family: monospace; font-size: 14px; font-weight: 700; letter-spacing: -0.5px; color: #09090b; display: inline-flex; align-items: center; }
    .brand-sub { color: #71717a; font-weight: 400; margin-left: 2px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #52525b; background: #f4f4f5; padding: 2px 8px; border-radius: 4px; border: 1px solid #e4e4e7; margin-top: 12px; }
    .title { font-size: 20px; font-weight: 600; margin: 12px 0 0 0; color: #09090b; letter-spacing: -0.02em; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 15px; font-weight: 500; margin-bottom: 8px; color: #18181b; }
    .text { font-size: 14px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
    .amount-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .amount-label { font-family: monospace; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
    .amount-val { font-family: monospace; font-size: 34px; font-weight: 700; color: #09090b; margin: 4px 0; }
    .cycle-val { font-family: monospace; font-size: 12px; color: #71717a; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 9px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; }
    .info-label { color: #71717a; }
    .info-value { text-align: right; font-weight: 500; color: #09090b; }
    .payment-box { background: #09090b; color: #fafafa; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; }
    .payment-title { font-family: monospace; font-size: 11px; text-transform: uppercase; color: #a1a1aa; margin-bottom: 6px; letter-spacing: 0.5px; }
    .payment-body { font-family: monospace; color: #ffffff; line-height: 1.5; word-break: break-all; }
    .footer { padding: 18px 24px; background: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 12px; font-family: monospace; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">99<span class="brand-sub">subcircle</span></div><br/>
      <div class="badge">${platform} • ${cycleMonth}</div>
      <h1 class="title">It's your turn to cover this month's plan</h1>
    </div>

    <div class="content">
      <div class="greeting">Hi ${payerName},</div>
      <p class="text">
        As part of the <strong>${groupName}</strong> subscription circle, you are scheduled as the responsible payer for <strong>${cycleMonth}</strong>.
      </p>

      <div class="amount-box">
        <div class="amount-label">Monthly Share Amount</div>
        <div class="amount-val">${currency}${amount}</div>
        <div class="cycle-val">Billing Cycle: ${cycleMonth}</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Circle Name</td>
          <td class="info-value">${groupName}</td>
        </tr>
        <tr>
          <td class="info-label">Platform</td>
          <td class="info-value">${platform}</td>
        </tr>
        <tr>
          <td class="info-label">Due Date</td>
          <td class="info-value">${dueDate}</td>
        </tr>
        <tr>
          <td class="info-label">Circle Host</td>
          <td class="info-value">${adminName} (${adminEmail})</td>
        </tr>
      </table>

      ${paymentDetails ? `
      <div class="payment-box">
        <div class="payment-title">Payment Instructions</div>
        <div class="payment-body">${paymentDetails.replace(/\n/g, '<br/>')}</div>
      </div>
      ` : ''}

      <p class="text" style="font-size: 13px; margin-bottom: 0;">
        Once paid, please reply to this notice or contact <strong>${adminName}</strong> to keep the circle running seamlessly.
      </p>
    </div>

    <div class="footer">
      99subcircle • Shared Subscription Circles
    </div>
  </div>
</body>
</html>
  `;
}

function getAdminReminderTemplate({ groupName, platform, amount, currency, payerName, payerEmail, cycleMonth, dueDate, nextPayerName }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${groupName} — Host Dispatch Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 32px 16px; color: #18181b; }
    .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .header { padding: 28px 24px 20px 24px; border-bottom: 1px solid #f4f4f5; }
    .brand { font-family: monospace; font-size: 14px; font-weight: 700; color: #09090b; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #52525b; background: #f4f4f5; padding: 2px 8px; border-radius: 4px; border: 1px solid #e4e4e7; margin-top: 12px; }
    .title { font-size: 20px; font-weight: 600; margin: 12px 0 0 0; color: #09090b; letter-spacing: -0.02em; }
    .content { padding: 28px 24px; }
    .summary-card { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .summary-title { font-weight: 600; color: #09090b; font-size: 14px; margin-bottom: 4px; }
    .summary-sub { font-size: 13px; color: #52525b; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 9px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; }
    .info-label { color: #71717a; }
    .info-value { text-align: right; font-weight: 500; color: #09090b; }
    .footer { padding: 18px 24px; background: #fafafa; border-top: 1px solid #f4f4f5; text-align: center; font-size: 12px; font-family: monospace; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">99subcircle</div><br/>
      <div class="badge">Host Digest • ${cycleMonth}</div>
      <h1 class="title">Billing reminder dispatched</h1>
    </div>

    <div class="content">
      <div class="summary-card">
        <div class="summary-title">${payerName} was notified</div>
        <div class="summary-sub">
          Payment request of <strong>${currency}${amount}</strong> was dispatched to <strong>${payerEmail}</strong>.
        </div>
      </div>

      <table class="info-table">
        <tr>
          <td class="info-label">Circle</td>
          <td class="info-value">${groupName} (${platform})</td>
        </tr>
        <tr>
          <td class="info-label">Assigned Member</td>
          <td class="info-value">${payerName}</td>
        </tr>
        <tr>
          <td class="info-label">Total Amount</td>
          <td class="info-value">${currency}${amount}</td>
        </tr>
        <tr>
          <td class="info-label">Due Date</td>
          <td class="info-value">${dueDate}</td>
        </tr>
        ${nextPayerName ? `
        <tr>
          <td class="info-label">Next Slot (Following Month)</td>
          <td class="info-value">${nextPayerName}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <div class="footer">
      99subcircle Host Digest
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = {
  getPayerReminderTemplate,
  getAdminReminderTemplate
};
