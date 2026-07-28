function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getData') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet();
      
      const parseSheet = (sheetName) => {
        const sh = sheet.getSheetByName(sheetName);
        if (!sh) return [];
        const data = sh.getDataRange().getValues();
        if (data.length < 2) return [];
        const headers = data[0];
        return data.slice(1).map(row => {
          const obj = {};
          headers.forEach((h, i) => {
            // Xử lý định dạng ngày tháng để không bị lỗi múi giờ
            let val = row[i];
            if (val instanceof Date) {
               val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
            }
            obj[h] = val;
          });
          return obj;
        });
      };
      
      const result = {
        status: 'success',
        data: {
          members: parseSheet('ThanhVien'),
          matches: parseSheet('TranDau'),
          transactions: parseSheet('ThuChi')
        }
      };
      
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput("Đây là Web App API của ứng dụng Quản lý bóng đá.")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const payload = data.payload;
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    const output = ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

    if (action === 'addMatch') {
      const matchSheet = sheet.getSheetByName('TranDau'); 
      if (!matchSheet) throw new Error("Không tìm thấy sheet 'TranDau'");
      
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
