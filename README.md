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

<ol>
<li>Declare a variable ui and set it equal to the UI of the form using FormApp.getUi().</li>
<li>Create a menu in the UI named 'Export Responses' using ui.createMenu()</li>
<li>Add an option to the menu named 'Select Destination Folder' that, when clicked, runs the showPicker() function</li>
<li>Add an option to the menu named 'Generate Report' that, when clicked, runs the showDatePicker() function</li>
<li>Add the menu to the UI using addToUi()</li>
</ol>

<h3>Note</h3>

onOpen() only needs to be run once to install the menus.

<h2>generateReportsInRange(dateRange)</h2>

<h3>Description</h3>

This function generates a Google Doc report of all the responses within the specified date range. It uses nested for loops to scan through each response and then through each question and answer. Any questions marked N/A will be excluded. Any unchecked items will be added to a 'missing items' row.

<h3>Inputs</h3>

<ul> <li>dateRange (Array of strings): An array of two strings representing the start and end date of the date range for which responses will be included in the report, according to submission date. The date format should be in "MM/dd/yyyy"
</li>
</ul>

<h3>Outputs</h3>

<ul><li>A Google Doc containing a report of all the responses within the specified date range. The report includes each question and answer, as well as a 'missing items' row for any unchecked items.</li></ul>
