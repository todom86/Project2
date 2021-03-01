# State Analysis

## Objective

The objective of this project was to analyze a dataset provide by Pew Research Center containing responses from a 2014 religious landscape survey.  To analyze this dataset, I chose to use JavaScripts D3 and Plotly libraries to display dynamics charts on a webpage.  While accomplishing this, I wanted to be able to create a MongoDB database to store the data I wanted to analyze, and access that database inside of my JavaScript to display my charts.

## Interpreting the Data

I imported the data into Jupyter Notebook to begin to analyze the data and see how the data was set up (depth of dataset can be seen in 'src/data/data.ipynb').  With such a wide dataset, and column names that weren't easily understood, I had to use a codebook provided with the dataset to determine what each column heading meant. I decided to find a few broad scopes to begin to analyze the data.  The categories I chose to initally look at are as follows:

	Ideology
	Age Group
	Generation
	Income
	Party
	Religion
	Sex

After using Jupyter to narrow the dataset down to these seven broad categories, I had to clean the information to make sure that it would display clearly what was being conveyed when I eventually started making my charts.

## Creating Database

After cleaning the data I had chosen to use, inside the notebook I used pymongo's MongoClient to convert my new dataset into JSON and load it into a Mongo database on my local server for testing.

## Creating the Web App

### Using Node.js

To access my newly created database I went with Node.js to handle the backend of my website.  This accesses my database and creates an API (currently handled on 'localhost:8000/data' as app is still in development) to be able to be called on with JavaScript.

### Node.js Essentials

After installing Node.js, I had to run the 'npm init -y' command in my project directory, which auto generates the 'node_modules' folder, as well as the 'package-lock.json' and 'package.json' files, which hold information (e.g. express and cors packages) needed to successfully run the app.

### Node Folder Tree

Inside my project I created a folder tree ('src') that holds almost all necessary files to run my web app.  Inside the 'src' folder contains the following folders:

	'assets': Contains 'css' folder for styling, and 'js' folder for JavaScript files.
	'config': contains 'configmongo.js' file, which contains the url to my local MongoDB server.
	'data': This folder is not needed to run the webpage but contains my Jupyter Notebook that was used to clean data and upload to MongoDB
	'routes': contains a 'mini-app' file that grabs the needed information from MongoDB.
	'views': contains .ejs files, which are interpreted as html files to display the webpage.

The only file outside of this folder tree is 'app.js' which is used to connect the backend (server-side) to the frontend (client-side) of my web app.

### 'src/routes'

#### '/getStateData.js'

This file is used to create a 'mini-app' file that grabs the needed information from MongoDB.  To do this I needed to require several node packages:

	'express': a package that allows me render information to a webpage
	'mongodb': a package that, when used with .MongoClient allows me to connect to my database
	'../config/configmongo.js': accesses the url needed to connect to the correct database
	'cors': a package that allows me to fetch information from the page I will be sending my API to

After importing these packages, I created a function that:
	grabs all information from my database and prepares to route that data to a webpage that I will declare in 'app.js'

### 'src/views'

#### '/index.ejs'

The 'index.ejs' file is written in the same format as an html file and is used to provide the structure for the webpage and declare all JavaScript dependencies that are needed to run my JavaScript code on that specific webpage.  In this case my index.ejs displays my charts and dropdown menus to filter the data.

### 'src/assets'

#### '/js/d3Chart.js'

This file is where all the magic happens that runs the charts displayed on the index page. Several essential functions are used create these charts.

	getStateInfo(): This function is used to determine what state and category that the user is looking for (provided from dropdown filters).  It then goes through the provided data, searches for each matching state name, calculates the total sum of the survey weights, then goes through all the entries for that provided state, then, for each sub-category in the provided category, sums up the total weights for each sub-category, and finds the percentage of that sub-category based on total weight of the state.  All of these percentages are pushed into an array to show an estimated percentage of people in the state that would have responded as a member of the sub-category. This array is organized in key-value pairs of {sub-category: percentage}

	xScale(): Maps the sub-categories of the user chosen category to the x-axis of the D3 chart.

	yScale(): Maps the percentages of each sub-category to the y-axis of the D3 chart.

	renderXAxis(): Removes the names of current sub-categories and replaces them with names of new sub-categories when user selects a new category from dropdown.

	renderRect(): Transitions current bars to the x-axis and removes them, then creates new rectangles based on new information and transistions them to correct heights.

	renderRectText(): Does the same as renderRect(), but applies to the percentages displayed above each bar.

	updateSpider(): Creates a Plotly pie chart with data provided from getStateInfo(). Note: originally was displayed as a spider graph but then changed to a pie chart, and function name was not updated.

All of these functions work together to display data based on the filters a user selects by using the dropdown menus.

### 'app.js'

This file is the initial file needed to start up and run the web app.  To achieve this, the express package needs to be imported to be able to render the .ejs files.  Also, the mini-app 'getStateData.js' needs to be imported as well.  The port is set to 8000 so we can tell the server which port we want the app to listen on to be able to find the script for the app.  Express is then set to find the views in the 'src/views' folder and told to look for '.ejs' files.  I then used the path '/data' to render my API to 'localhost:8000/data' so that inside my 'd3Chart.js' I can tell my script where to look for the information needed to create the charts.  I then render the 'index.ejs' file to the index('/') path and finally tell the app to listen to the selected port to display my web app.

Since this app is still in development, in the terminal it is needed to navigate to the project directory and run 'node app.js' in order to connect the server to the selected port.

## Future Updates

The plan for this app is to provide a better user interface, a more in-depth analysis of the data then the seven broad categories used so far, and a full deployment using Heroku.

## Resources

Data provided by:

	“Pew Research Center 2014 U.S. Religious Landscape Study.” Pew Research Center, Washington, D.C. (05/12/2015) https://www.pewforum.org/dataset/pew-research-center-2014-u-s-religious-landscape-study/.

Note: Full data file was removed from 'src/data' as to not public post the entire dataset provided from Pew Research Center.