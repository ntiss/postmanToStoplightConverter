# Postman to Stoplight Converters

These tools convert :
* Postman collections to Stoplight collections. Try it [online here](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/converter.html)
 * Multiple Postman environments to a Stoplight environment file. Try it [online here](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/envConverter.html).

## Requirements
* The input Postman collection MUST be at 2.1 format

## Usage
* Simply [open the Collection converter](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/converter.html) or the [Environments converter](http://htmlpreview.github.io/?https://github.com/ntiss/postmanToStoplightConverter/blob/master/envConverter.html)
* Pick your Postman collection file from your disk. For environments, you can pick multiple files.
* Click the convert button
* Copy/paste the result into Stoplight "</>Code" tab of your TESTING section or in the ".stoplkight" file for the environment.

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
