var shell     = require('shelljs/global'),
    utils     = require('./utils'),
    readline  = require('readline'),
    fs        = require('fs'),
    path      = require('path');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Arguments needed to run the script
var scriptArguments = {
    'company' : 'string',
    'project' : 'string',
    'width'   : 'integer',
    'height'  : 'integer'
};

var scriptUsage =   "Usage: " + "company"   + "{" +   scriptArguments.company  + "} " +
                                "project"   + "{" +   scriptArguments.project  + "} " +
                                "width"     + "{" +   scriptArguments.width    + "} " +
                                "height"    + "{" +   scriptArguments.height   + "} ";
var userSettingsFile,
    projectDestination;

var questionList    = [],
    macroList       = [],
    settingJSONkey  = [];

var userPreferences = {};

checkArguments();
setUserDefaultSettings();

function checkArguments() {
    if (getUserArguments().length < 4) {
        echo(scriptUsage);
        exit(1);
    }

    getUserArguments().forEach(function (val, index, array) {
        // TODO check against scriptArguments

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

    var index = 0;

    for(var key in scriptArguments) {
        index++;
        scriptArguments[key] = [];
        scriptArguments[key].push(getUserArguments()[index - 1]);
    }
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
    var newProjectPath = userPreferences.path_to_new_project[0];
    projectDestination = newProjectPath + scriptArguments.project[0];
    projectTemplate    = pwd() + path.sep + 'template';

    // Check if the project directory exists
    // Exit script if project exists
    if (!test('-d', projectDestination)) {
        cp('-R', projectTemplate, newProjectPath);
        mv(newProjectPath + 'template', newProjectPath + scriptArguments.project[0]);
    } else {
        echo('Project ' + scriptArguments.project[0] + ' already exists!');
        rl.close();
    }

    replaceTemplateMacro();
}

function replaceTemplateMacro() {
    for (var key in scriptArguments) {
        echo(key);
        echo(scriptArguments[key][0]);
    }
    // (( i=0; i<${#REPLACE_LIST[@]}; i=(i+2) ))
    // do
    //     FIND=${REPLACE_LIST[$i]};
    //     REPLACE=${REPLACE_LIST[(i+1)]};

    //     # Rename directories
    //     find "$PROJECT_DESTINATION" -type d \( -iname "*$FIND*" \) | xargs rename 's#'"$FIND"'#'"$REPLACE"'#g';

    //     # Rename in files
    //     grep -Irl "$FIND" "$PROJECT_DESTINATION" | xargs sed -i "" 's#'"$FIND"'#'"$REPLACE"'#g';

    //     # Rename files
    //     find "$PROJECT_DESTINATION" -type f \( -iname "*$FIND*" \) | xargs rename 's#'"$FIND"'#'"$REPLACE"'#g';
    // done

}