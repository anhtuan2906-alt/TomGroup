function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Đảm bảo bật quyền cho phép truy cập (CORS)
    const output = ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

    if (action === 'addMatch') {
      const matchSheet = sheet.getSheetByName('TranDau'); 
      if (!matchSheet) throw new Error("Không tìm thấy sheet 'TranDau'");
      
      // Các cột: id, date, opponent, location, result, score
      matchSheet.appendRow([
        payload.id,
        payload.date,
        payload.opponent,
        payload.location,
        payload.result,
        payload.score || ''
      ]);
    } 
    else if (action === 'addTransaction') {
      const txSheet = sheet.getSheetByName('ThuChi');
      if (!txSheet) throw new Error("Không tìm thấy sheet 'ThuChi'");
      
      // Các cột: id, type, amount, date, description, memberId, matchId
      txSheet.appendRow([
        payload.id,
        payload.type,
        payload.amount,
        payload.date,
        payload.description,
        payload.memberId || '',
        payload.matchId || ''
      ]);
    }

    return output;
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
