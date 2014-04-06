var shell     = require('shelljs/global'),
    utils     = require('./utils'),
    readline  = require('readline'),
    fs        = require('fs'),
    path      = require('path'),
    rpl       = require('replace');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Arguments needed to run the script
var scriptArguments = [
    {'company'      : 'string'},
    {'project'      : 'string'},
    {'width'        : 'integer'},
    {'height'       : 'integer'},
    {'browser'      : 'string'},
    {'projectPath'  : 'string'}
];

var defaultMacro = [
    {'company'      : '__company_name__'},
    {'project'      : '__project_name__'},
    {'width'        : '__project_width__'},
    {'height'       : '__project_height__'},
    {'browser'      : '__browser_path__'},
    {'projectPath'  : '__project_path__'}
];

var scriptUsage =   "Usage: " + "company"   + "{" +   scriptArguments[0].company  + "} " +
                                "project"   + "{" +   scriptArguments[1].project  + "} " +
                                "width"     + "{" +   scriptArguments[2].width    + "} " +
                                "height"    + "{" +   scriptArguments[3].height   + "} ";
var userSettingsFile,
    projectDestination,
    projectTemplate,
    previousMacro,
    dirRenamed = 0;

var questionList    = [],
    macroList       = [],
    settingJSONkey  = [];

// User preferences set in UserSettings.json
var userPreferences = {};

checkArguments();
setUserDefaultSettings();

function checkArguments() {
    if (getUserArguments().length < 4) {
        echo(scriptUsage);
        exit(1);
    }

    getUserArguments().forEach(function (val, index, array) {
        scriptArguments.forEach(function (v, i, argsArray) {
            for (var value in argsArray[index]) {
                if ((argsArray[index][value] === 'integer') && !utils.isInteger(val)) {
                    echo(scriptUsage);
                    exit(1);
                } else if ((argsArray[index][value] === 'string') && utils.isInteger(val)) {
                    echo(scriptUsage);
                    exit(1);
                }
                // Replace value of array with user input
                argsArray[index][value] = [];
                argsArray[index][value].push(array[index]);
            }
        });
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
    var defaultSettingsJSON = [
        {
            macro: '__new_project_path__',
            question: 'Please enter the destination path of your new project: '
        },
        {
            macro: '__as_classes_path__',
            question: 'Please enter the path to your ActionScript Classes: ',
        },
        {
            macro: '__default_browser_path__',
            question: 'Please enter the path to your default browser: '

        }
    ];

    if (!test('-f', 'UserSettings.json')) {
        cp(defaultSettingsFile, 'UserSettings.json');
    }

    userSettingsFile = pwd() + path.sep + find('UserSettings.json');

    var settingsKeys     = [];
    var index            = 0;
    var canAskQuestion   = false;

    fs.readFile(userSettingsFile, 'utf8', function (err, data) {
        if (err) {
            echo('Error: ' + err);
            return;
        }
        data = JSON.parse(data);

        for(var attributename in data) {
            settingsKeys.push(attributename);
        }

        defaultSettingsJSON.forEach(function(key) {
            index++;
            // Check if macros have been replaced
            if (data[settingsKeys[index - 1]] === key.macro) {
                // Replace macros with user input.
                settingJSONkey.push(settingsKeys[index - 1]);
                questionList.push(key.question);
                macroList.push(key.macro);

                if (!canAskQuestion) {
                    askQuestion(function() {
                        copyTemplate();
                    });
                    canAskQuestion = true;
                }
            } else {
                // Save user preferences from the JSON data
                var pathPreferences = data[settingsKeys[index - 1]];
                // Check for end trailing slash
                if (pathPreferences.slice(-1) != path.sep) {
                    // Add a trailing slash
                    pathPreferences = pathPreferences + path.sep;
                }

                userPreferences[settingsKeys[index - 1]] = [];
                userPreferences[settingsKeys[index - 1]].push(pathPreferences);

                if (index > defaultSettingsJSON.length - 1) {
                    // Copy template
                    copyTemplate();
                }
            }
        });
    });
}

function askQuestion(callback) {
    replaceSettingMacro(userSettingsFile, macroList.shift(), questionList.shift(), settingJSONkey.shift(), function() {
        if (macroList.length < 1 || questionList.length < 1) {
            callback();
        } else {
            askQuestion(callback);
        }
    });
}

function replaceSettingMacro(jsonFile, strFind, question, settingKey, callback) {
    userPreferences[settingKey] = [];
    askUserInput(question, function(strReplace) {
        // Check for end trailing slash
        if (strReplace.slice(-1) != path.sep) {
            // Add a trailing slash
            strReplace = strReplace + path.sep;
        }
        userPreferences[settingKey].push(strReplace);
        sed('-i', strFind, strReplace, jsonFile);
        callback();
    });
}

function askUserInput(string, callback) {
    rl.question(string, function(answer) {
        fs.exists(answer, function(exists) {
            if (exists === false) {
                echo('File ' + answer + ' not found!');
                askUserInput(string, callback);
            } else {
                callback(answer);
            }
        });
    });
}

function copyTemplate() {
    var projectPathPref = scriptArguments[1];
    var newProjectPath  = userPreferences.path_to_new_project[0];
    projectDestination  = newProjectPath + projectPathPref.project[0];
    projectTemplate     = pwd() + path.sep + 'template';

    // Save user input into scriptArguments
    scriptArguments[4].browser = [];
    scriptArguments[4].browser.push(userPreferences.path_to_browser[0]);
    scriptArguments[5].projectPath = [];
    scriptArguments[5].projectPath.push(projectDestination);

    // Check if the project directory exists
    // Exit script if project exists
    checkForProject(newProjectPath, projectPathPref, function() {
        replaceTemplateMacro();
    });
}

function checkForProject(newProjectPath, projectPathPref, callback) {
    if (!test('-d', projectDestination)) {
        cp('-R', projectTemplate, newProjectPath);
        mv(newProjectPath + 'template', newProjectPath + projectPathPref.project[0]);
        callback();
    } else {
        echo('Project ' + projectPathPref.project[0] + ' already exists!');
        rl.close();
    }
}

function replaceTemplateMacro() {
    var fileArray = [];
        dirArray = [];

    listCurrentDirectories(fileArray, dirArray);

    renameInFiles(fileArray, function() {
        renameDirectories(dirArray, 0, fileArray, function() {
            echo('DONE');
        });
    });
}

function listCurrentDirectories(fileArray, dirArray) {
    var listArray = [];

    // Grab all the current files in the project destination
    listArray = find(projectDestination);
    listArray.forEach(function (v, i, arr) {
        // Remove directories from the list
        if (v.indexOf(".") != -1) {
            fileArray.push(v);
        } else {
            dirArray.push(v);
        }
    });
}

function renameInFiles(fileArray, callback) {
    var findStr,
        replaceStr;

    scriptArguments.forEach(function (val, index, array) {
        for (var value in array[index]) {
            findStr = defaultMacro[index][value];
            replaceStr = array[index][value][0];
            // Rename in files
            fileArray.forEach(function (v, i, arr) {
                rpl({
                    regex: findStr,
                    replacement: replaceStr,
                    paths: [v],
                    recursive: true,
                    silent: true,
                });
            });
        }
        if (index >= scriptArguments.length - 1) {
            callback();
        }
    });
}

function renameDirectories(dirArray, index, fileArray, callback) {
    var findStr = defaultMacro[index],
        replaceStr = scriptArguments[index];

    dirRenamed++;

    dirArray.forEach(function(val, i, arr) {
        for (var key in findStr) {
            if (val.indexOf(".") < 0) {
                var myReg = new RegExp(findStr[key], "g");
                var newstr = val.replace(myReg, replaceStr[key][0]);
                if (newstr != val) {
                    if ((test('-d', val) && (!test('-d', newstr)))) {
                        renameFolder(val, newstr, function() {
                            checkForRenamedDir(dirArray, fileArray, function(newDirArray) {
                                if (canRename(newstr)) {
                                    renameDirectories(newDirArray, dirRenamed, fileArray, callback);
                                }
                            });
                        });
                    }
                }
            }
        }
    });
}

function canRename(newstr) {
    // newstr to check if exists in path
    echo(dirRenamed)
    if (dirRenamed < 2) {
        return true;
    } else {
        return false;
    }
}

function checkForRenamedDir(savedDir, fileArray, callback) {
    dirArray = [];
    listCurrentDirectories(fileArray, dirArray);
    if (dirArray != savedDir) {
        callback(dirArray);
    }
}

function renameFolder(val, newstr, callback) {
    fs.rename(val, newstr, function (err) {
        if (err) echo(err);
        echo('Renamed');
        callback();
    });
}