# Postman to Stoplight Converter

This tool converts Postman collections to Stoplight collections.

## Requirements
* The input Postman collection MUST be at 2.1 format

## Usage
* Simply open the HTML page
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
