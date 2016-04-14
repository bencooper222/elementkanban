/**
 * Serves HTML of the application for HTTP GET requests.
 * If folderId is provided as a URL parameter, the web app will list
 * the contents of that folder (if permissions allow). Otherwise
 * the web app will list the contents of the root folder.
 *
 * @param {Object} e event parameter that can contain information
 *     about any URL parameters provided.
 */
function doGet(e) {
    var template = HtmlService.createTemplateFromFile('Index');

    // Retrieve and process any URL parameters, as necessary.
    if (e.parameter.folderId) {
        template.folderId = e.parameter.folderId;
    } else {
        template.folderId = 'root';
    }

    // Build and return HTML in IFRAME sandbox mode.
    return template.evaluate()
        .setTitle('Kanban Web App')
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}




var kanban = SpreadsheetApp.openById("YOUR SPREADSHEET KEY HERE").getSheets(); // find it here
var pendingRequests = []; // requests that are still being processed


function getTeamSheet(teamNumber) {
    return kanban[teamNumber + 3];
}


function postRequest(requestInfo) {
    Logger.log(requestInfo)
    var requestSheet = kanban[0]; // the sheet where all requests get pushed
    var newRow = requestSheet.getLastRow() + 1;
    pendingRequests.push(requestInfo, newRow);
    Logger.log(pendingRequests);
    requestInfo.push("=vlookup(A" + newRow + ",'Team Database'!$A$1:$I$25,9,false)");
    requestInfo.push("=vlookup(A" + newRow + ",'Team Database'!$A$1:$I$25,8,false)");

    for (var i = 0; i < requestInfo.length; i++) {
        requestSheet.getRange(newRow, i + 1).setValue(requestInfo[i]);
    }

}


function sendTeamInfo(teamNumber) {
    var teamInfo = [];

    var teamSheet = getTeamSheet(teamNumber);

    var toDo = teamSheet.getRange(2, 1, teamSheet.getLastRow()-1).getValues();
    var doing = teamSheet.getRange(2, 2, teamSheet.getLastRow()-1).getValues();
    var done = teamSheet.getRange(2, 3, teamSheet.getLastRow()-1).getValues();

    teamInfo.push(toDo);
    teamInfo.push(doing);
    teamInfo.push(done);
    Logger.log(teamInfo);
    return teamInfo;

}

function countArray(array){
  var count = 0; 
  var int = array.length;

while (int--) {
    if (array[int] != "")
        count++;
}
  return count;
}


function receiveColumnChange(teamNumber, taskNumber,currentColumn, nextColumn) {
   
  //if (nextColumn==2){

    var teamSheet = getTeamSheet(teamNumber-1)
    if (currentColumn<nextColumn){
    var taskCell = teamSheet.getRange(taskNumber + 1, nextColumn - 1);  
    var newTaskCell = teamSheet.getRange(taskNumber+1,nextColumn);
    }
    else{
       var taskCell = teamSheet.getRange(taskNumber + 1, nextColumn + 1);  
       var newTaskCell = teamSheet.getRange(taskNumber+1,nextColumn);
    
    }
    
  Logger.log(countArray(teamSheet.getRange(2,2,21).getValues()));
  if (nextColumn == 2 && countArray(teamSheet.getRange(2,2,21).getValues())==3){
    Logger.log("too many tasks");
  }
  else {
          newTaskCell.setValue(taskNumber);
    taskCell.setValue(""); 
  }
      
  var dataReturned = [taskNumber, currentColumn, nextColumn];
        
   return dataReturned;
  
    
}


function teamVerification(password){
  var teamDatabase = kanban[2];
  var teamNumber = false;
  for (var i=0; i<teamDatabase.getLastRow(); i++){
     var currentCheck = teamDatabase.getRange(i+2,3).getValue();
    if (currentCheck==password){
      teamNumber = teamDatabase.getRange(i+2,1).getValue();
    }
   
  }
  return teamNumber
}


function testing() {
   receiveColumnChange(1,13,1,2);
}
