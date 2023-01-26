//Author: Jacob Golle
//Date Created: December 14, 2022
//Last Modified: January 25, 2023
//Version: 1.2
//Summary: This plug in selects a set of user responses from Google Forms within a specified date range and will send the information to a google doc for printing/displaying. It will be stored in a folder specified by the user.
//Documentation: https://docs.google.com/document/d/1Q1vUXpPc1vgdJSzAdQXbaNO3IUEKxcaR8z-soQilZm8/edit?usp=sharing

/* VERSION 1.3 TODO:
 * 1. Add letter heard or more report formatting
 * 2. Adjust response tables positioning so they don't break in between pages
 * 3. Fix center alignment bug
 */

function onOpen() {
  var ui = FormApp.getUi();
  ui.createMenu('Export Responses')
  .addItem('Select Destination Folder', 'showPicker')
  .addItem('Generate Report', 'showDatePicker')
  .addToUi();
}

/*
* Generates google doc report of all the responses within the specified date range. Uses nested for loops to scan through
* each responses and then through each question and answer. Any questions marked N/A will be excluded. Any unchecked items
* will be added to a 'missing items' row.
* @dateRange: the range of which responses will be included in the report, according to submission date
*/ 
function generateReportsInRange(dateRange){
  var form = FormApp.getActiveForm();
  var formUi = FormApp.getUi();
  var dateRanges = [];
  //var dateRanges = promptDate();
  //if(dateRanges == null){return null;}
  dateRanges[0] = Utilities.parseDate(dateRange[0], "EST", "MM/dd/yyyy");
  dateRanges[1] = Utilities.parseDate(dateRange[1], "EST", "MM/dd/yyyy");
  
  //create and name the google doc where the responses will be exported
  var responsesDoc = DocumentApp.create
    ('Site Inspection Summaries for ' + 
    Utilities.formatDate(dateRanges[0], "EST", "MM/dd/yyyy") + " to " +
    Utilities.formatDate(dateRanges[1], "EST", "MM/dd/yyyy"));
  
  //adjust time of end date to ensure it captures any responses on that day
  dateRanges[1].setHours(23);
  dateRanges[1].setMinutes(59)
  dateRanges[1].setSeconds(59);
    
  //** FOLDER ID SPECIFIED HERE **//
  var file = DriveApp.getFileById(responsesDoc.getId());
  file.moveTo(DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('folderID')));
  //** FOLDER ID SPECIFIED HERE **//

  //Store all responses within the specified date range in an array
  var allResponses = form.getResponses();
  var responsesInRange = [];
  for(var i = 0; i < allResponses.length; i++){
    if(allResponses[i].getTimestamp() >= dateRanges[0] && allResponses[i].getTimestamp() <= dateRanges[1]){
      responsesInRange.push(allResponses[i]);
    }
  }

  //prepare styling for the document
 var responseHeaderStyle = {
  [DocumentApp.Attribute.HEADING]: DocumentApp.ParagraphHeading.HEADING1,
  [DocumentApp.Attribute.FONT_FAMILY]: DocumentApp.FontFamily.TIMES_NEW_ROMAN,
  [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER
};

  var questionStyle = {};
  questionStyle[DocumentApp.Attribute.BOLD] = true;

  //write answers and questions to the document
  var responsesDocBody = responsesDoc.getBody();
    for(var i = 0; i < responsesInRange.length; i++){
      var missingItems = [];
      var responsesItems = responsesInRange[i].getItemResponses();
      var responseHeader = responsesDocBody.appendParagraph("Site inspection summary for " + 
      Utilities.formatDate(responsesInRange[i].getTimestamp(), "EST", "MM-dd-yyyy"));
      responseHeader.setAttributes(responseHeaderStyle);
      var questionAndAnswerArray = [['Question', 'Answer']];

      for(var j = 0; j < responsesItems.length; j ++){
        //building the question and answer table
        var question = responsesItems[j].getItem().getTitle().toString();
        var answer = responsesItems[j].getResponse().toString();
        questionAndAnswerArray.push([question, answer]);

        //building the missing items row, not adding unchecked items where "N/A" is checked
        var item = responsesItems[j].getItem();
        if(item.getType() == FormApp.ItemType.CHECKBOX){
          var options = item.asCheckboxItem().getChoices();
          var naChecked = false;
            for(var n = 0; n < options.length; n++){
              if(options[n].getValue() == "N/A"){
                naChecked = true;
                break;
              } 
            }
            
            //if NA isn't checked, loop through the options, comparing them to the checked answers, 
            //and adding anything that isn't included in the checked options to the missing items array.
            if(!naChecked){
              for(var n = 0; n < options.length; n++){
                if(!answer.includes(options[n].getValue()) && options[n].getValue() != "N/A"){
                  missingItems.push(options[n].getValue());
                }
              }
            }

            questionAndAnswerArray.push(["Missing Items", missingItems.join(", ")]);
            //reset missing items array
            missingItems = [];
          }     
      }

      var newTable = responsesDocBody.appendTable(questionAndAnswerArray);
      //set first column width to 150.0 pts allowing for more room in answerColumn and reducing the over all document size
      newTable.setColumnWidth(0, 150);
      //set the entire first column to bold
      for(var k = 0; k < newTable.getNumRows(); k++){
        newTable.getCell(k, 0).setAttributes(questionStyle);
      }
      newTable.getCell(0, 1).setAttributes(questionStyle);
      responsesDocBody.appendParagraph("");
   }

  responsesDoc.saveAndClose();
  formUi.alert("Task Completed!");
  return;
}

/**
 * Displays an HTML-service dialog in the Form that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService.createHtmlOutputFromFile('Picker.html')
    .setWidth(700)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showModalDialog(html, 'Select Folder');
}

//used in the drive picker
function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

function setSelectedFolder(id){
  PropertiesService.getScriptProperties().setProperty('folderID', id.toString());
}

function logFolderID(){
  Logger.log(PropertiesService.getScriptProperties().getProperty('folderID'));
}

function showDatePicker(){
  var html = HtmlService.createHtmlOutputFromFile('DatePrompt.html')
    .setWidth(600)
    .setHeight(350)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showModalDialog(html, 'Select Dates');
}