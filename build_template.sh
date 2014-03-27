#!/bin/bash

pwd=`pwd`;
# Colours for the script
red=$(tput setaf 1);
# Reset colours
textreset=$(tput sgr0);

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
	"__company_name__" "$COMPANY_NAME"
	"__project_name__" "$PROJECT_NAME"
	"__project_name__" "$PROJECT_NAME"
	"__project_width__" "$PROJECT_WIDTH"
	"__project_height__" "$PROJECT_HEIGHT"
);

# New project destination to copy template
# Currently added on the current directory
PROJECT_DESTINATION="${pwd}/new_projects/";
PROJECT_TEMPLATE="${pwd}/template/";

# Copy content of template
cp -rf ${PROJECT_TEMPLATE} ${PROJECT_DESTINATION};

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