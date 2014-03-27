#!/bin/bash

pwd=`pwd`;
# Colours for the script
red=$(tput setaf 1);
# Reset colours
textreset=$(tput sgr0);

# New project destination to copy template
# Currently added on the current directory
PROJECT_DESTINATION="${pwd}/new_projects/";
PROJECT_TEMPLATE="${pwd}/template/";

# Copy content of template
cp -rf ${PROJECT_TEMPLATE} ${PROJECT_DESTINATION};

if (( $# != 4 ))
then
	echo -e "${red}Usage: company project width height${textreset} \n";
    exit;
fi

COMPANY_NAME="$1";
PROJECT_NAME="$2";
PROJECT_WIDTH="$3";
PROJECT_HEIGHT="$4";

REPLACE_LIST=(
	"Company_name" "$COMPANY_NAME"
	"!project_name!" "$PROJECT_NAME"
	"Project_name" "$PROJECT_NAME"
	"!project_width!" "$PROJECT_WIDTH"
	"!project_height!" "$PROJECT_HEIGHT"
);

for (( i=0; i<${#REPLACE_LIST[@]}; i=(i+2) ))
do
	FIND=${REPLACE_LIST[$i]}
	REPLACE=${REPLACE_LIST[(i+1)]}
	grep -Irl "$FIND" "$PROJECT_DESTINATION" | xargs sed -ie "" 's#'"$FIND"'#'"$REPLACE"'#g'
done


