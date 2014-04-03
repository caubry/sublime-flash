var shell = require('shelljs/global'),
    utils = require('./utils'),
    fs    = require('fs'),
    path  = require('path');

// Arguments needed to run the script
var scriptUsage = "Usage: company{string} project{string} width{integer} height{integer}";

checkArguments();
setUserDefaultSettings();

function checkArguments() {
    if (getUserArguments().length < 4) {
        echo(scriptUsage);
        exit(1);
    }
    getUserArguments().forEach(function (val, index, array) {
        
        /* Current value as a string should be only true
        for the first and second arguments OR
        Current value as an integer should be only true
        for the third and forth arguments */
        if ((!(index === 0 || index === 1) && !utils.isInteger(val)) ||
            (!(index === 2 || index === 3) && utils.isInteger(val))) {
            echo(scriptUsage);
            exit(1);
        }
    });
}

// Four arguments are needed to execute the script
function getUserArguments() {
    var userArgs = [];
    process.argv.forEach(function (val, index, array) {
        if (index > 1) userArgs.push(val);
    });
    return userArgs;
}

function setUserDefaultSettings() {

    var defaultSettingsFile = find('DefaultSettings.json');
    var defaultSettingsJSON = {
        __new_project_path__      : 'Please enter the destination path of your new project: ',
        __as_classes_path__       : 'Please enter the path to your ActionScript Classes: ',
        __default_browser_path__  : 'Please enter the path to your default browser: '
    };

    var macrosKeySettings = [
        'path_to_new_project',
        'path_to_as_classes',
        'path_to_browser'
    ];

    if (!test('-f', 'UserSettings.json')) {
        cp(defaultSettingsFile, 'UserSettings.json');
        // Replace macros with user inputs.
        // Replace defaultSettingsJSON key with user input
    } else {
        var userSettingsFile    = pwd() + path.sep + find('UserSettings.json');
        var userPreferences     = [];

        fs.readFile(userSettingsFile, 'utf8', function (err, data) {
            if (err) {
                echo('Error: ' + err);
                return;
            }
            data = JSON.parse(data);
            
            macrosKeySettings.forEach(function(key) {
                userPreferences.push(data[key]);
            });

            echo(userPreferences);
        });
    }


    // var userSettingsFile = find('UserSettings.json');
    // echo(userSettingsJSON);

    // Check if macros exist in UserSettings.json
    // for (var key in defaultSettingsJSON) {
    //     if (! grep(key, userSettingsFile)) {
    //         // If they don't use the current value
    //         for(var attributename in userSettingsJSON){
    //             // console.log(attributename+": "+userSettingsJSON[attributename]);
    //         }
    //     }
    // }

    // Replace macros in UserSettings.json file
    // ls('*.js').forEach(function(file) {
    //     sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
    //     sed('-i', /.*REMOVE_THIS_LINE.*\n/, '', file);
    //     sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, cat('macro.js'), file);
    // });

    // for (var key in defaultSettingsJSON) {
    //     sed('-i', key, 'poo', 'UserSettings.json');
    // }
    
    // defaultSettingsJSON.forEach(function(userSettingsFile))) {
    //     echo(userSettingsFile);
    // }

    // var defaultSettingsDir = fs.readdirSync(__dirname),
        // index = defaultSettingsDir.indexOf('DefaultSettings.json'),
        // defaultSettingsPath = __dirname + path.sep + defaultSettingsDir[index],
        // userSettingsPath = __dirname + path.sep + 'UserSettings.json';

  //   var defaultSettingsJSON = {
  //       __new_project_path__      : 'Please enter the destination path of your new project: ',
  //       __as_classes_path__       : 'Please enter the path to your ActionScript Classes: ',
  //       __default_browser_path__  : 'Please enter the path to your default browser: '
  //   };

  //   if (userSettingsPath) {
		// echo("dont exists");
  //   }

    // fs.exists(userSettingsPath, function(exists) {
    //     // Do not override UserSettings.json 
    //     if (exists === false) {
    //         // Copy DefaultSettings into UserSettings
    //         utils.copyFile(fs, defaultSettingsPath, userSettingsPath, function(err) {});
    //         // Prompt preferences questions to user
    //         var setting = Object.keys(defaultSettingsJSON);
    //         setting.forEach(function(setting) {
    //             askUserInput(
    //                 defaultSettingsJSON[setting],
    //                 function(answer) {
    //                     changeFromUserInput(userSettingsPath, setting, answer);
    //                 }
    //             );
    //         });
    //     } else {
    //         // Check for placeholder in file
    //         // var smth = mydata.list[0]["points.bean.pointsBase"][0].time;
    //     }
    // });
}