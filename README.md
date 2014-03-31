# ActionScript project in SublimeText

## Why?
Because setting up a project from stratch everytime can become tedious.  
Because SublimeText > FlashDevelop.  
Because allowing to easily set the dimensions of a new project is cool.  

## orly?
Yes, really!  
When running the bash script you will be able to customise the dimensions of your new fresh project,
set the company or username and the project name, ideal for your new namespace.
It also keeps a track of your ActionScript Classes source folder and your prefered web browser, 
so you won't have to set your preferences all the time. 

## Prerequisites 
###1. Any version of Adobe Flash
###2. Flex SDK binary set in your $PATH

- Download the Flex SDK  
> From the [Adobe website.](http://www.adobe.com/devnet/flex/flex-sdk-download.html)  
> Place it somewhere sensible.  
> Example: /Users/caubry/lib/flex_sdk_4.6  

- Flex binary
> You need to add Flex binary to your current $PATH  
> Example: /Users/caubry/lib/flex_sdk_4.6/bin  
> I've added mine to my ~/.bash_profile  

You can now compile a project using the mxmlc command.  

###3. Brew package manager

- More information can be found on the [brew website.](http://brew.sh/)  
- Install the package manager with ruby:

```
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)";
```

## Why brew?

The script uses brew to install two small libraries: rename and jq  
> 'rename' is used to easily rename placeholders in files and placeholder in directories' names. While 'jq' is a JSON parser allowing to retrieve values from JSON files.

## What's next?

Currently this script only works for Mac users.  
If you are one of them just fork the repository and start running the bash script: build_template.sh  
The script takes four arguments:
> company name  
> project name  
> project width  
> & project height  

Example from command line:  

```
cd actionscript-project-template
bash build_template.sh caubry new_project 640 360
```

The script creates a new folder located in the current directory, with the passed arguments.  
First time run, it will ask for your prefered directory where your new project can be created.  

```
Please enter the destination path of your new project:
> /d/workspace
```

Once set, you will be able to change this set location from your UserSettings.json.  
Next, it will prompt you to enter the path to your ActionScript Classes.  
Mine are located at: /Applications/Adobe Flash CS6/Common/Configuration/ActionScript 3.0/projects/Flash/src  
So, I just need to paste a this path, such as:

```
Please enter the path to your ActionScript Classes:
> /Applications/Adobe Flash CS6/Common/Configuration/ActionScript 3.0/projects/Flash/src
```

It will also ask for your prefered web browser: 

```
Please enter the path to your default browser:
> /Applications/Google Chrome.app
```

If you don't have rename and jq libraries installed, the script will ask you if you wish to install them.  
Unfortunately, if you don't want to install them it will exit the script.  
I might try to avoid using these libraies in the future, but for the time being you'll need them.

And that's it!  
You should now be able to see the pink text 'It works!' embedded in a SWF, displayed in your web browser page, with the dimemsions previously set.  
The project is now ready to be used as you wish!

## TODO

- Translate an existing FlashDevelop project to SublimeText;
- Create a bash script for Git Bash on Windows;
- Stop the script for exiting when the user enters a wrong path.
