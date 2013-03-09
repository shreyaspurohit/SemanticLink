Semantic Link
=============

The project 'Semantic Links' started as a sample application I started to develop to present node.js and its capabilities to my team. After some amount of development I realized that the idea and the application is good to be put for real production usage. The source code is open source and provided under MIT license.

The idea has many parts to it. Short links makes no sense when distributed or shared with others till they click and access the link. This application takes tags input, that are used to create the short links so that the link is more helpful before it is clicked. If the tags are not provided then the application will generate the random string of values as short link for the impatient few who do not want to give tag input.

The application was built with idea of generating more interesting analytics of web page usages. So, if you select the checkbox to generate much better link, the application will try to access the link provided and create the new link using the tags and the webpage contents. The interesting part of this challenge is that the response time needs to be sufficient enough so that I dont piss you off. This feature is still in beta and provides "ok" to "good" results.

The analytics generated includes the web pages key contents, the browser and OS environment that accessess it, the the time at which these contents are accessed, any patterns of access, and much more. The application will not collect any personal information. The technologies used to develop this application is Node.JS with many of its modules and mongodb as database to store information, deployed as a small cluster in every node. It uses map/reduce on mongodb to process and generate many of its analytics.

Live in Action
--------------
Deployed currently at http://sl.bitourea.com/. 

Licensing
---------
Released under MIT license, go ahead and use, modify, distribute as you wish. The license is provided in LICENSE.txt. The license of other libraries used must be used as defined by them. 	
