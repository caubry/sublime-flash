#!/bin/bash

pwd=`pwd -P`;
# Colours for the script
red=$(tput setaf 1);
yellow=$(tput setaf 2);
# Reset colours
colourreset=$(tput sgr0);
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

# New project destination to copy template
# Currently added on the current directory
PROJECT_DESTINATION="${pwd}/$PROJECT_NAME";
PROJECT_TEMPLATE="${pwd}/template";

# Copy content of template
if ! [ -d "${PROJECT_DESTINATION}" ]
then
	cp -rf ${PROJECT_TEMPLATE} ${PROJECT_DESTINATION};
fi

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

# Edit fla
FLA_PATH=$(find "$PROJECT_DESTINATION" -type f \( -iname "*.fla" \));
DOM_NAME="DOMDocument.xml";
PUBLISH_NAME="PublishSettings.xml";
BUILD_CONFIG=$(find "$PROJECT_DESTINATION" -type f \( -iname "build-config.xml" \));
MAIN_PATH=$(find "$PROJECT_DESTINATION" -type f \( -iname "Main.as" \));

# Extract DOMDocument.xml
if ! [ -f "${DOM_NAME}" ]
then
	unzip -q "$FLA_PATH" "$DOM_NAME" 2> /dev/null;
fi

# Rename in files
grep -Irl "width" "$DOM_NAME" | xargs sed -i "" 's/width="640"/width="'"$PROJECT_WIDTH"'"/';
grep -Irl "height" "$DOM_NAME" | xargs sed -i "" 's/height="360"/height="'"$PROJECT_HEIGHT"'"/';

# Put back into fla
zip -q -m "$FLA_PATH" "$DOM_NAME" 2> /dev/null;

# and the same treatment for the publish settings xml
if ! [ -f "${PUBLISH_NAME}" ]
then
	unzip -q "$FLA_PATH" "$PUBLISH_NAME" 2> /dev/null;
fi	

# Rename in files
grep -Irl "__project_name__" "$PUBLISH_NAME" | xargs sed -i "" 's/__project_name__/'"$PROJECT_NAME"'/';

# Put back into fla
zip -q -m "$FLA_PATH" "$PUBLISH_NAME" 2> /dev/null;

mxmlc -load-config+="$BUILD_CONFIG" -file-specs "${MAIN_PATH}" -source-path+="/Applications/Adobe Flash CS6/Common/Configuration/ActionScript 3.0/projects/Flash/src";
