const SHEET_ID = 'THAY_ID_CUA_BAN_VAO_DAY'; // Ví dụ: '1aBcD_eFgHiJkL...'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;

    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (action === 'addMatch') {
      // Tìm sheet Matches (hoặc thay bằng tên sheet trận đấu của bạn, ví dụ: 'Trận đấu')
      const sheet = ss.getSheetByName('Matches') || ss.getSheets()[1]; 
      const newId = 'match-' + new Date().getTime();
      
      // Thứ tự cột: id, date, opponent, location, result, score
      sheet.appendRow([
        newId, 
        payload.date, 
        payload.opponent, 
        payload.location, 
        payload.result, 
        payload.score
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    else if (action === 'addTransaction') {
      // Tìm sheet Transactions (hoặc thay bằng tên sheet thu chi của bạn, ví dụ: 'Thu chi')
      const sheet = ss.getSheetByName('Transactions') || ss.getSheets()[2];
      const newId = 't-' + new Date().getTime();
      
      // Thứ tự cột: id, date, description, amount, type, memberId
      sheet.appendRow([
        newId,
        payload.date,
        payload.description,
        payload.amount,
        payload.type,
        payload.memberId || ''
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
