#!/bin/bash

pwd=`pwd -P`;
# Colours for the script
red=$(tput setaf 1);
yellow=$(tput setaf 2);
# Reset colours
colourreset=$(tput sgr0);
# Return line, with ">"
cr=`echo -e '\n> '`;
# Arguments needed
scriptusage="Usage: company{string} project{string} width{integer} height{integer}";

if [ "$#" -ne 4 ]
then
    # Four arguments are needed to execute the script
    echo -e "${red}$scriptusage${colourreset}";
    exit;
else
    # Positive integer
    numericalRegex='^[0-9]+$';

    for args in "$@"
    do
        # Check if the current value is a number
        if [[ "$args" =~ $numericalRegex ]] 
        then
            # Current value as a number should be only true
            # for the third and forth arguments
            if ! [[ "$args" -eq $3 || "$args" -eq $4 ]]
            then
                # Prompt the script usage
                echo -e "${red}Invalid arguments \n$scriptusage${colourreset}"; 
                exit;
            fi
        else
            # Current value as a string should be only true
            # for the first or second arguments
            if ! [[ "$args" == $1 || "$args" == $2 ]] 
            then
                echo -e "${red}Invalid arguments \n$scriptusage${colourreset}"; 
                exit;
            fi
        fi
    done
fi

COMPANY_NAME="$1";
PROJECT_NAME="$2";
PROJECT_WIDTH="$3";
PROJECT_HEIGHT="$4";

REPLACE_LIST=(
    "__company_name__" "$COMPANY_NAME"
    "__project_name__" "$PROJECT_NAME"
    "__project_width__" "$PROJECT_WIDTH"
    "__project_height__" "$PROJECT_HEIGHT"
);

PROJECT_TEMPLATE="${pwd}/template";

function installRenameCommand()
{
    brew install rename;

    command -v rename >/dev/null 2>&1 || 
    { 
        echo "Something went horribly wrong and pngquant hasn't been installed! (╯°□°）╯︵ ┻━┻";
        exit; 
    }

    echo -e "\n********************************** \n******* Installation done! ******* \n**********************************";
    replaceList;
}

function checkRenameCommand()
{
    command -v rename >/dev/null 2>&1 || 
    { 
        echo -e >&2 "\n*******************\nrename command line hasn't been installed.\nThis library is needed to rename directories and files.\n*******************"; 
        
        while true; do
            read -p "`echo $'\n> '`Do you wish to install this program (Y/N)? " yn
            case $yn in
                [Yy]* ) installRenameCommand; break;;
                [Nn]* ) echo "End"; exit;;
                * ) echo "Please answer Yes or No.";;
            esac
        done
        exit; 
    }
}

function replaceList()
{
    for (( i=0; i<${#REPLACE_LIST[@]}; i=(i+2) ))
    do
        FIND=${REPLACE_LIST[$i]};
        REPLACE=${REPLACE_LIST[(i+1)]};

        # Rename directories
        find "$PROJECT_DESTINATION" -type d \( -iname "*$FIND*" \) | xargs rename 's#'"$FIND"'#'"$REPLACE"'#g';

        # Rename in files
        grep -Irl "$FIND" "$PROJECT_DESTINATION" | xargs sed -i "" 's#'"$FIND"'#'"$REPLACE"'#g';

        # Rename files
        find "$PROJECT_DESTINATION" -type f \( -iname "*$FIND*" \) | xargs rename 's#'"$FIND"'#'"$REPLACE"'#g';
    done

    findFiles;
}

function createFLA()
{
    # Change fla settings
    DOM_NAME="DOMDocument.xml";

    # Extract DOMDocument.xml
    if ! [ -f "${DOM_NAME}" ]
    then
        unzip -q "$FLA_PATH" "$DOM_NAME" 2> /dev/null;
    fi

    # Change the dimension of the fla
    grep -Irl "width" "$DOM_NAME" | xargs sed -i "" 's/width="640"/width="'"$PROJECT_WIDTH"'"/';
    grep -Irl "height" "$DOM_NAME" | xargs sed -i "" 's/height="360"/height="'"$PROJECT_HEIGHT"'"/';

    zip -qm "$FLA_PATH" "$DOM_NAME" 2> /dev/null;
}

function changePublishSettings()
{
    # Change fla settings
    PUBLISH_NAME="PublishSettings.xml";

    # Extract PublishSettings.xml
    if ! [ -f "${PUBLISH_NAME}" ]
    then
        unzip -q "$FLA_PATH" "$PUBLISH_NAME" 2> /dev/null;
    fi  

    grep -Irl "new_project" "$PUBLISH_NAME" | xargs sed -i "" 's/new_project/'"$PROJECT_NAME"'/';

    zip -qm "$FLA_PATH" "$PUBLISH_NAME" 2> /dev/null;
}

function replaceSettingPlaceholder()
{
    for (( i=0; i<${#SETTINGS_REPLACE_LIST[@]}; i=(i+2) ))
    do
        FIND=${SETTINGS_REPLACE_LIST[$i]};
        REPLACE=${SETTINGS_REPLACE_LIST[(i+1)]};

        # Save path entered by user to UserSettings.json
        grep -Irl "$FIND" "$USER_SETTINGS" | xargs sed -i "" 's#'"$FIND"'#'"$REPLACE"'#g';
    done
}

function parseJSON()
{
    
    # Use a JSON parser to retrieve values
    PROJECT_DESTINATION=$(cat $USER_SETTINGS | jq '.path_to_new_project');
    AS_CLASSES_PATH=$(cat $USER_SETTINGS | jq '.path_to_as_classes');
    DEFAULT_BROWSER_PATH=$(cat $USER_SETTINGS | jq '.path_to_browser');

    # Replaces leading " with nothing, and trailing " with nothing too
    PROJECT_DESTINATION=$(echo "${PROJECT_DESTINATION}" | sed -e 's/^"//'  -e 's/"$//');
    # Check for trailing slash at the end of the project destination
    if ! [ "${PROJECT_DESTINATION:$i:1}" == "/" ]
    then
        # Add a trailing slash
        PROJECT_DESTINATION=$PROJECT_DESTINATION"/";
    fi

    PROJECT_DESTINATION=${PROJECT_DESTINATION}$PROJECT_NAME;
    AS_CLASSES_PATH=$(echo "$AS_CLASSES_PATH" | sed -e 's/^"//'  -e 's/"$//');
    DEFAULT_BROWSER_PATH=$(echo "$DEFAULT_BROWSER_PATH" | sed -e 's/^"//'  -e 's/"$//');
}

function installJQCommand()
{
    brew install jq;

    command -v jq >/dev/null 2>&1 || 
    { 
        echo "Something went horribly wrong and pngquant hasn't been installed! (╯°□°）╯︵ ┻━┻";
        exit; 
    }

    echo -e "\n********************************** \n******* Installation done! ******* \n********************************** \n";
    
    parseJSON;
    runMxmlc;
    launchIndex;
}

function checkJQCommand()
{
    command -v jq >/dev/null 2>&1 || 
    { 
        echo -e >&2 "\n*******************\njq command line hasn't been installed.\nThis library is needed to parse the JSON data.\nMore info can be found at: http://stedolan.github.io/jq/\n*******************"; 
        
        while true; do
            read -p "`echo $'\n> '`Do you wish to install this program (Y/N)? " yn
            case $yn in
                [Yy]* ) installJQCommand; break;;
                [Nn]* ) echo "End"; exit;;
                * ) echo "Please answer Yes or No.";;
            esac
        done
        exit; 
    }

    parseJSON;
}

function setUserDefaultSettings()
{
    DEFAULT_SETTINGS=$(find "${pwd}" -type f \( -iname "DefaultSettings.json" \));

    if ! [ -f "UserSettings.json" ]
    then
        cp $DEFAULT_SETTINGS UserSettings.json
    fi
    
    USER_SETTINGS=$(find "${pwd}" -type f \( -iname "UserSettings.json" \));

    # Check if placeholders exist
    projectDestination=$(grep -Irl "__new_project_path__" "$USER_SETTINGS");
    asPlaceHolder=$(grep -Irl "__as_classes_path__" "$USER_SETTINGS");
    defaultBrowserPlaceHolder=$(grep -Irl "__default_browser_path__" "$USER_SETTINGS");

    if ! [[ -z "$asPlaceHolder" || -z "$defaultBrowserPlaceHolder" || -z "$projectDestination" ]]
    then
        # New project destination to copy template
        echo -ne "\nPlease enter the destination path of your new project: $cr";
        read destinationPath;
        PROJECT_DESTINATION="$destinationPath";

        # Check for trailing slash at the end of the project destination
        if ! [ "${PROJECT_DESTINATION:${#PROJECT_DESTINATION} - 1}" == "/" ]
        then
            # Add a trailing slash
            PROJECT_DESTINATION=$PROJECT_DESTINATION"/";
        fi

        # Check if path exists
        if [[ ! -d "$PROJECT_DESTINATION" ]]
        then
            # Exit script if path doesn't exist
            echo "File "$PROJECT_DESTINATION" not found!";
            exit;
        fi
        
        PROJECT_DESTINATION=${PROJECT_DESTINATION}$PROJECT_NAME;

        SETTINGS_REPLACE_LIST=(
            "__new_project_path__" "$PROJECT_DESTINATION"
        );

        replaceSettingPlaceholder;

        # Ask path to the ActionScript folder
        echo -ne "\nPlease enter the path to your ActionScript Classes: $cr";
        read asPath;
        AS_CLASSES_PATH="$asPath";

        # Check if path exists
        if [[ ! -d "$AS_CLASSES_PATH" ]]
        then
            # Exit script if path doesn't exist
            echo "File "$AS_CLASSES_PATH" not found!";
            exit;
        fi

        SETTINGS_REPLACE_LIST=(
            "__as_classes_path__" "$AS_CLASSES_PATH"
        );

        replaceSettingPlaceholder;

        # Ask path to the default browser
        echo -ne "\nPlease enter the path to your default browser: $cr";
        read defaultBrowser;
        DEFAULT_BROWSER_PATH="$defaultBrowser";

        # Check if path exists
        if [[ ! -d "$DEFAULT_BROWSER_PATH" ]]
        then
            # Exit script if path doesn't exist
            echo "File "$DEFAULT_BROWSER_PATH" not found!";
            exit;
        fi

        SETTINGS_REPLACE_LIST=(
            "__default_browser_path__" "$DEFAULT_BROWSER_PATH"
        );

        echo -e '\n';
        replaceSettingPlaceholder;
    else
        # jq command line tool is needed to parse JSON
        checkJQCommand;
    fi
}

function runMxmlc()
{
    command -v mxmlc >/dev/null 2>&1 || 
    { 
        echo -e >&2 "\n*******************\nmxmlc command line hasn't been installed.\nThis library is needed to compile the project.\n Please follow the README instructions. \n*******************"; 
        exit; 
    }

    mxmlc -load-config+="$BUILD_CONFIG" -file-specs "${MAIN_PATH}" -source-path+="${AS_CLASSES_PATH}";
}

function launchIndex()
{
    echo -e "${yellow}Launching index.html...${colourreset}";
    open "$DEMO_INDEX" -a "$DEFAULT_BROWSER_PATH";
}

function findFiles()
{
    FLA_PATH=$(find "$PROJECT_DESTINATION" -type f \( -iname "*.fla" \));
    BUILD_CONFIG=$(find "$PROJECT_DESTINATION" -type f \( -iname "build-config.xml" \));
    MAIN_PATH=$(find "$PROJECT_DESTINATION" -type f \( -iname "Main.as" \));
    DEMO_INDEX=$(find "$PROJECT_DESTINATION" -type f \( -iname "index.html" \));

    createFLA;
    changePublishSettings;
    runMxmlc;
    launchIndex;
}

setUserDefaultSettings;
# rename command line tool is needed to rename directories and files
checkRenameCommand;

# Copy content of template
if ! [ -d "${PROJECT_DESTINATION}" ]
then
    cp -rf ${PROJECT_TEMPLATE} ${PROJECT_DESTINATION};
fi

replaceList;
