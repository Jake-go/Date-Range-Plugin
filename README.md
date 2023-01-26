# Date-Range-Plugin
Author: Jacob Golle
<br>Date Created: December 13, 2022
<br>Last Modified: January 15, 2022
<br>Version: 1.2
<br>Contact: 
<br>jake.mmg@gmail.com
<br>techsupport@cedarlandhomes.ca

<h1>Summary:</h1>

This application is a bound Google Script that implements a feature into the Google Form: Site Inspection Checklist. The purpose is to export responses within a specified date range to a .doc file. 

User Instructions:

In the top-right corner of the page, there is an add-ons icon. Left-click on it and you will see a drop-down menu appear. In the menu, there should be an option “Export Responses.” Left-click on it.

When you click “Export Responses, a pop-up should appear in the top-middle section of your browser. Click “Select Destination Folder”.

A prompt will appear to select your desired folder in your google drive to store the report. Your folder should already be created and cannot be done within the prompt. Be sure to set this up beforehand.

Once you have selected your destination folder, open the menu again and select “Generate Report.” This will create a prompt that intakes two dates. The input is protected to always input a date range, so typing incorrect input will default the input to what it was previously.

After successfully submitting a date range, the application will loop through the responses, adding the relevant information to a table and appending that table to a google .doc that will be created within your destination folder. This will include a missing items row at the bottom that summarizes all missing items at a site.

<h2>Troubleshooting</h2>

<b>Problem:</b> "I can't find the exported report in the specified Google Drive folder." 
<br><b>Solution:</b> Make sure that you have selected the correct Google Drive folder before generating the report. Double-check the folder's location and the folder ID stored in the script properties.

<b>Problem:</b> "I am getting an error message 'Invalid date range'." 
<br><b>Solution:</b> Make sure that the date range selected is valid and the end date is not before the start date.

<b>Problem:</b> "I am getting an error message 'Unable to load the file picker'."
<br><b>Solution:</b> Make sure that you are logged in to your Google account and that you have granted the necessary permissions for the plug-in to access your Google Drive.

<b>Problem:</b> "I am getting an error message 'Insufficient permissions to access the file'." 
<br><b>Solution:</b> Make sure that you have given the necessary permissions to the plug-in in order to access the specified Google Drive folder.

<b>Problem:</b> "The folder selector only shows already created Google Drive folders I have access to, I can't create a new folder within that window." 
<br><b>Solution:</b> You must create a new folder before using the folder selector. You can create a new folder using the Google Drive interface.

<b>Problem:</b> "The titles for the tables in the generated report are not centered."
<br><b>Solution:</b> Currently, the solution for this issue is to manually center the titles. A solution for this issue is being explored and should be part of the next version.

<h1><b>Dev Documentation:</b></h1>

<h1>Summary</h1>

The Google Forms plug-in is designed to select a set of user responses within a specified date range, and send the information to a Google Doc for printing or displaying. The responses will be stored in a folder specified by the user. The plug-in has three main files:

<ul>
<li>Main.gs: This file contains the core logic of the plug-in, including the following functions:</li>
<ul><li>onOpen(): This function creates a menu in the Google Forms UI with two options: "Select Destination Folder" and "Generate Report".</li>
<li>generateReportsInRange(dateRange): This function generates a Google Doc report of all the responses within the specified date range. It uses nested for loops to scan through each response and then through each question and answer. Any questions marked N/A will be excluded. Any unchecked items will be added to a 'missing items' row.</li>
<li>showPicker(): This function displays an HTML-service dialog in the Form that contains client-side JavaScript code for the Google Picker API.
</li>
<li>showDatePicker(): This function displays an HTML-service dialog in the Form that prompts the user to select a date range.</li>
<li>getOAuthToken(): This function is used in the drive picker to request an OAuth token, which is needed to access the user's Google Drive.
</li>
<li>setSelectedFolder(id): This function is used to set the Google Drive folder ID selected by the user in the picker dialog to the script properties, so it can be used later to store the responses</li>
</ul>
<li>Picker.html: This file displays a dialog box that allows the user to select a Google Drive folder, the selected folder ID is passed to the script to store it for later use.
</li>
<li>DatePrompt.html: This file displays a dialog box that prompts the user to select a date range, the selected date range is passed to the script to use it to filter the responses.</li>
</ul>

In summary, the plug-in allows the user to select a date range and a Google Drive folder, and then generates a report of all the responses within that date range and stores them in the specified folder. The HTML files provide a user-friendly interface for selecting the date range and folder, while the JavaScript functions in the code.gs file handle the logic and interactions with the Google API.

<h1>Main.gs</h1>

<h2>onOpen()</h2>

<h3>Description</h3>

This function is automatically triggered when the Google Form is opened. It creates a menu in the Google Forms UI with two options, 'Select Destination Folder' and 'Generate Report'.

<h3>Inputs</h3>

None

<h3>Outputs</h3>

<ul><li>A menu in the Google Forms UI with options, 'Select Destination Folder and 'Generate Report'</li></ul>

<h3>Pseudocode</h3>


1. Declare a variable `ui` and set it equal to the UI of the form using `FormApp.getUi()`.
2. Create a menu in the UI named 'Export Responses' using `ui.createMenu()`
3. Add an option to the menu named 'Select Destination Folder' that, when clicked, runs the `showPicker()` function
4. Add an option to the menu named 'Generate Report' that, when clicked, runs the `showDatePicker()` function
5. Add the menu to the UI using `addToUi()`

<h3>Note</h3>

`onOpen()` only needs to be run once to install the menus.

<h2>generateReportsInRange(dateRange)</h2>

<h3>Description</h3>

This function generates a Google Doc report of all the responses within the specified date range. It uses nested for loops to scan through each response and then through each question and answer. Any questions marked N/A will be excluded. Any unchecked items will be added to a 'missing items' row.

<h3>Inputs</h3>

- `dateRange` (Array of strings): An array of two strings representing the start and end date of the date range for which responses will be included in the report, according to submission date. The date format should be in "MM/dd/yyyy"

<h3>Outputs</h3>

<ul><li>A Google Doc containing a report of all the responses within the specified date range. The report includes each question and answer, as well as a 'missing items' row for any unchecked items.</li></ul>

<h3>Example</h3>

```generateReportsInRange(["01/01/2022", "01/15/2022])```
 
This function call will generate a report of all responses from January 1st, 2022 to January 15th, 2022 and store it in a folder specified by the user.

<h3>Pseudocode</h3>

1. Declare a variable form and set it equal to the active form using `FormApp.getActiveForm()`.
2. Declare a variable dateRanges and set it equal to an empty array.
3. Parse the start and end date of the date range from string to JavaScript date object and add them to the `dateRanges` array.
4. Create a Google Doc, name it Site Inspection Summaries for plus the start date in the format of "MM/dd/yyyy" plus " to " plus end date in the format of "MM/dd/yyyy"
5. Adjust the end date's time to ensure it captures any responses on that day by using `setHours(),setMinutes(),setSeconds()`
6. Move the newly created Google Doc to the specified folder using `DriveApp.getFileById()` and `DriveApp.getFolderById()`
7. Declare a variable allResponses and set it equal to all the responses of the form using `form.getResponses()`
8. Declare a variable `responsesInRange` and set it equal to an empty array.
9. Using a for loop, iterate through all the responses and check if the timestamp of the response is greater than or equal to the start date and less than or equal to the end date. If the condition is true, push the response to the `responsesInRange` array.
10. Declare some styling options for the document and a variable responsesDocBody to store the body of the newly created Google Doc
11. Using a for loop, iterate through the responses in range and declare a variable missingItems and set it equal to an empty array
12. Declare a variable `responsesItems` to store the `responsesInRange[i].getItemResponses()`
13. Write the answers and questions to the document using the `responsesDocBody.appendParagraph()` and `responsesDocBody.appendListItem()`
14. Return the newly created Google Doc

<h2>showDatePicker()</h2>

**Description**
This function displays an HTML-service dialog in the Form that allows the user to specify the date range for the report.

**Inputs**
- None

**Outputs**
- An HTML-service dialog that allows the user to specify the date range for the report.

**Pseudocode**
1. Declare a variable `html` and set it equal to the output of `HtmlService.createHtmlOutputFromFile('DatePrompt.html')`
2. Set the width of the HTML-service dialog to 700 pixels using `.setWidth(700)`
3. Set the height of the HTML-service dialog to 350 pixels using `.setHeight(350)`
4. Set the sandbox mode of the HTML-service dialog to IFRAME using `.setSandboxMode(HtmlService.SandboxMode.IFRAME)`
5. Show the HTML-service dialog as a modal using `FormApp.getUi().showModalDialog(html, 'Select Dates')`

**Note:** It is important to note that the `DatePrompt.html` file should exist in the same project and should contain the HTML and JavaScript code that allows the user to specify the date range for the report.

<h2>showPicker()</h2>

<h3>Description</h3>

This function displays an HTML-service dialog in the Form that contains client-side JavaScript code for the Google Picker API. It allows the user to select a folder as the destination where the report will be stored.

<h3>Inputs</h3>

None

<h3>Outputs</h3>

<ul><li>An HTML-service dialog that contains client-side JavaScript code for the Google Picker API.</li></ul>

<h3>Example</h3>

```showPicker()```

<h3>Pseudocode</h3>

1. Declare a variable `html` and set it equal to the output of `HtmlService.createHtmlOutputFromFile('Picker.html')`
2. Set the width of the HTML-service dialog to 600 pixels using `.setWidth(600)`
3. Set the height of the HTML-service dialog to 475 pixels using `.setHeight(475)`
4. Set the sandbox mode of the HTML-service dialog to IFRAME using `.setSandboxMode(HtmlService.SandboxMode.IFRAME)`
5. Show the HTML-service dialog as a modal using `FormApp.getUi().showModalDialog(html, 'Select Folder')`

It is important to note that the `Picker.html` file should exist in the same project and should contain the client-side JavaScript code for the Google Picker API that is responsible for allowing the user to select a folder.

<h2>getOAuthToken()</h2>

<h3>Description</h3>

This function is used to get the OAuth token required to interact with Google Drive.

<h3>Inputs</h3>

None

<h3>Outputs</h3>

The OAuth Token

<h3>Pseudocode</h3>

1. Call `DriveApp.getRootFolder()`
2. Return the OAuth token using `ScriptApp.getOAuthToken()`

<h2>seSelectedFolder(id)</h2>

<h3>Description</h3>

This function is used to store the ID of the selected Google Drive folder in script properties.

**Inputs**
- id: ID of the selected Google Drive folder

**Outputs**
- None

**Pseudocode**
1. Set the selected folder's ID in script properties using `PropertiesService.getScriptProperties().setProperty('folderID', id.toString());`

**Note:** This function is used on the Google Script side to interact with the HTML file and pass the required information between them.

<h1>HTML Files</h1>

<h2>DatePrompt.html</h2>

**Description**
This file is an HTML-service dialog that is displayed by the `showDatePicker()` function in the Google Script. It allows the user to specify the date range for the report by using the Bootstrap-daterangepicker library.

**Inputs**
- None

**Outputs**
- An HTML-service dialog that allows the user to specify the date range for the report.

**Pseudocode**
1. Include jQuery, moment.js, Bootstrap CSS, and Bootstrap-daterangepicker library using the CDN links.
2. Create a form with an input field of type text with class `daterange` and a submit button.
3. When the page loads, use jQuery to apply the Bootstrap-daterangepicker library to the input field with class `daterange`.
4. Define a JavaScript function `submitDaterange()` that is called when the form is submitted.
5. Inside the `submitDaterange()` function, use jQuery to get the selected date range from the input field with class `daterange`.
6. Split the selected date range into an array of two dates and convert them into JavaScript `Date` objects.
7. Check if the start date is greater than the end date. If it is, display an alert message saying "Invalid date range, please try again." and return from the function.
8. Format the start and end date in the format of `MM/dd/yyyy`.

Create an array with the two formatted dates and pass it to the `generateReportsInRange()` function in the Google Script using `google.script.run.generateReportsInRange(dateArray)`

<h2>Picker.html</h2>

**Description**
The `Picker.html` file is used to display a dialog box that allows the user to select a Google Drive folder.

**Inputs**
- None

**Outputs**
- The ID of the selected Google Drive folder.

**Pseudocode**
1. Load the Google Picker API using `gapi.load('picker', {callback: function () {pickerApiLoaded = true;}});`
2. Get an OAuth token using `google.script.run.withSuccessHandler(createPicker).withFailureHandler(showError).getOAuthToken();`
3. Create a new Google Picker object that allows the user to select Google Drive Folders and sets the callback function to `pickerCallback`
4. Set the visibility of the picker to true.
5. When the user selects a folder, the `pickerCallback` function is called, it gets the folder's ID and pass it to the `setSelectedFolder` function in the Google Script and close the dialog box.
6. If the user cancels the operation, the dialog box is closed.

**Note:** The functions that are used to interact with the Google Script are:
- `google.script.run.withSuccessHandler(createPicker).withFailureHandler(showError).getOAuthToken();`
- `google.script.run.setSelectedFolder(id);`
- `google.script.host.close();`

