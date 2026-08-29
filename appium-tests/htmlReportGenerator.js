// appium-tests/htmlReportGenerator.js
// Generates a dark-themed HTML execution report from Appium/Android test results

const fs = require('fs');
const path = require('path');

function generateHtmlReport(testResults, outputPath) {
  const totalTests = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const passRate = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(1) : '0.0';
  const totalDuration = testResults.reduce((s, r) => s + r.duration, 0);
  const generatedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const mode = process.env.CI === 'true' ? 'CI Simulation Mode' : 'Live Appium Session';

  const rowsHtml = testResults.map((r, i) => {
    const statusClass = r.status === 'PASS' ? 'pass' : 'fail';
    const statusIcon = r.status === 'PASS' ? '✅' : '❌';
    const detailsEscaped = (r.details || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    return `
    <tr class="row-${i % 2 === 0 ? 'even' : 'odd'}">
      <td class="td-id">${r.id}</td>
      <td>${r.name}</td>
      <td class="td-num">${r.duration}ms</td>
      <td><span class="badge ${statusClass}">${statusIcon} ${r.status}</span></td>
      <td class="td-details">${detailsEscaped}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Style AI — Appium Android Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%);
      padding: 32px 40px;
      border-bottom: 2px solid #30363d;
    }
    .header h1 { font-size: 26px; font-weight: 700; color: #ffffff; }
    .header p  { font-size: 14px; color: #8b949e; margin-top: 6px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding: 28px 40px;
    }
    .stat-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 10px;
      padding: 20px 24px;
      text-align: center;
    }
    .stat-card .value { font-size: 36px; font-weight: 700; }
    .stat-card .label { font-size: 12px; color: #8b949e; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-card.total  .value { color: #58a6ff; }
    .stat-card.pass   .value { color: #3fb950; }
    .stat-card.fail   .value { color: #f85149; }
    .stat-card.rate   .value { color: #d2a8ff; }
    .stat-card.time   .value { color: #ffa657; font-size: 26px; }
    .mode-badge {
      display: inline-block;
      margin: 0 40px 20px;
      padding: 6px 16px;
      background: rgba(255,166,87,0.15);
      border: 1px solid rgba(255,166,87,0.3);
      border-radius: 20px;
      font-size: 12px;
      color: #ffa657;
      font-weight: 600;
    }
    .section { padding: 0 40px 40px; }
    .section h2 { font-size: 16px; color: #8b949e; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #30363d; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; background: #161b22; border-radius: 10px; overflow: hidden; border: 1px solid #30363d; }
    thead th { background: #1a3a2a; color: #ffffff; padding: 12px 16px; font-size: 12px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
    .row-even { background: #161b22; }
    .row-odd  { background: #1c2128; }
    td { padding: 12px 16px; font-size: 13px; vertical-align: top; border-bottom: 1px solid #21262d; }
    .td-id   { font-family: monospace; color: #3fb950; font-weight: 600; white-space: nowrap; }
    .td-num  { text-align: right; font-family: monospace; color: #ffa657; }
    .td-details { font-size: 12px; color: #8b949e; line-height: 1.6; max-width: 480px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge.pass { background: rgba(63,185,80,0.15); color: #3fb950; border: 1px solid rgba(63,185,80,0.3); }
    .badge.fail { background: rgba(248,81,73,0.15); color: #f85149; border: 1px solid rgba(248,81,73,0.3); }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #484f58; border-top: 1px solid #21262d; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📱 Style AI — Appium Android E2E Test Execution Report</h1>
    <p>Generated: ${generatedAt} &nbsp;|&nbsp; Framework: Appium 2.x / WebDriverIO &nbsp;|&nbsp; Platform: Android (UiAutomator2)</p>
  </div>

  <div class="mode-badge">⚙️ Execution Mode: ${mode}</div>

  <div class="stats-grid">
    <div class="stat-card total">
      <div class="value">${totalTests}</div>
      <div class="label">Total Tests</div>
    </div>
    <div class="stat-card pass">
      <div class="value">${passed}</div>
      <div class="label">Passed</div>
    </div>
    <div class="stat-card fail">
      <div class="value">${failed}</div>
      <div class="label">Failed</div>
    </div>
    <div class="stat-card rate">
      <div class="value">${passRate}%</div>
      <div class="label">Pass Rate</div>
    </div>
    <div class="stat-card time">
      <div class="value">${(totalDuration / 1000).toFixed(2)}s</div>
      <div class="label">Total Duration</div>
    </div>
  </div>

  <div class="section">
    <h2>Test Case Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test ID</th>
          <th>Test Case Name</th>
          <th>Duration</th>
          <th>Status</th>
          <th>Execution Details / Error Logs</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Style AI Appium Android E2E Test Suite &nbsp;•&nbsp; Auto-generated by htmlReportGenerator.js
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`HTML report successfully written to: ${outputPath}`);
}

module.exports = { generateHtmlReport };
