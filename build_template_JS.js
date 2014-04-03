var utils    = require('./utils'),
    shell    = require('./shell.js'),
    readline = require('readline'),
    fs       = require('fs'),
    path     = require('path');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Arguments needed to run the script
var scriptUsage = "Usage: company{string} project{string} width{integer} height{integer}";

checkArguments();

var companyName   = getUserArguments()[0],
    projectName   = getUserArguments()[1],
    projectWidth  = getUserArguments()[2],
    projectHeight = getUserArguments()[3];

var replaceList = {
    __company_name__    : companyName,
    __project_name__    : projectName,
    __project_width__   : projectWidth,
    __project_height__  : projectHeight
};

var projectTemplate = __dirname + "/template";

setUserDefaultSettings();

// Four arguments are needed to execute the script
function getUserArguments() {
    var userArgs = [];
    process.argv.forEach(function (val, index, array) {
        if (index > 1) userArgs.push(val);
    });
    return userArgs;
}

function checkArguments() {
    if (getUserArguments().length < 4) {
        console.log(scriptUsage);
        process.exit();
    }
    getUserArguments().forEach(function (val, index, array) {
        /*
        Current value as a string should be only true
        for the first and second arguments OR
        Current value as an integer should be only true
        for the third and forth arguments
        */
        if ((!(index === 0 || index === 1) && !utils.isInteger(val)) ||
            (!(index === 2 || index === 3) && utils.isInteger(val))) {
            console.log(scriptUsage);
            process.exit();
        }
    });
}

function setUserDefaultSettings() {
    var defaultSettingsDir = fs.readdirSync(__dirname),
        index = defaultSettingsDir.indexOf('DefaultSettings.json'),
        defaultSettingsPath = __dirname + path.sep + defaultSettingsDir[index],
        userSettingsPath = __dirname + path.sep + 'UserSettings.json';

    var defaultSettingsJSON = {
        __new_project_path__      : 'Please enter the destination path of your new project: ',
        __as_classes_path__       : 'Please enter the path to your ActionScript Classes: ',
        __default_browser_path__  : 'Please enter the path to your default browser: '
    };

    fs.exists(userSettingsPath, function(exists) {
        // Do not override UserSettings.json 
        if (exists === false) {
            // Copy DefaultSettings into UserSettings
            utils.copyFile(fs, defaultSettingsPath, userSettingsPath, function(err) {});
            // Prompt preferences questions to user
            var setting = Object.keys(defaultSettingsJSON);
            setting.forEach(function(setting) {
                askUserInput(
                    defaultSettingsJSON[setting],
                    function(answer) {
                        changeFromUserInput(userSettingsPath, setting, answer);
                    }
                );
            });
            // askUserInput(
            //     'Please enter the destination path of your new project: ',
            //     function (answer) {
            //         changeFromUserInput(userSettingsPath, defaultSettingJSON[0], answer);
            //         askUserInput(
            //             'Please enter the path to your ActionScript Classes: ',
            //             function(answer) {
            //                 changeFromUserInput(userSettingsPath, defaultSettingJSON[1],answer);
            //                 askUserInput(
            //                     'Please enter the path to your default browser: ',
            //                     function(answer) {
            //                         changeFromUserInput(userSettingsPath, defaultSettingJSON[2], answer);
            //                     }
            //                 );
            //             }
            //         );
            //     }
            // );
        } else {
            // Check for placeholder in file
            // var smth = mydata.list[0]["points.bean.pointsBase"][0].time;
        }
    });
}

function askUserInput(string, callback) {
    rl.question(string, function(answer) {
        fs.exists(answer, function(exists) {
            if (exists === false) {
                console.log('File ' + answer + 'not found!');
                askUserInput(string, callback);
            } else {
                callback(answer);
            }
        });
    });
}

function changeFromUserInput(path, find, replace) {
    // Check if placeholders exist in UserSettings.json
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(find, replace);
        fs.writeFile(path, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}







