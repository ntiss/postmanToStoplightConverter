# Postman to Stoplight Converter

This tool converts Postman collections to Stoplight collections. Try it [online here](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/converter.html).

A second tool converts multiple Postman environments to a Stoplight environment file. Try it [online here](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/envConverter.html).

## Requirements
* The input Postman collection MUST be at 2.1 format

## Usage
* Simply open the HTML page. Try it [online here](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/converter.html)
* Paste your Postman collection into the textarea
* Click the button
* Copy/paste the result into Stoplight "</>Code" tab of your TESTING section.

## Features
* Converts all requests in steps
* Manages Postman folders and sub-folders
* Replaces {{myVar}} by {$$.env.myVar}
* Try to detect usual assertions (experimental)

## Limitations
* Doesn't detect captures
* Doesn't use Stoplight $.ctx

## Support
No support, thanks :-)
