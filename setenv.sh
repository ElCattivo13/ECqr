#!/bin/echo That's not how this works. You have to do it like this: source

# tool versions
VERSION_NODEJS="14.15.4"
VERSION_ANGULAR="13"

# git-root relative directory, where the toolchain will be "installed"
TOOLCHAIN_DIR="toolchain"

#######################################################################

# the directory, where the script is. the same as the git root
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# make the toolchain directory absolute
TOOLCHAIN_DIR="${DIR}/${TOOLCHAIN_DIR}"

# if needed create the toolchain directory
if [ ! -d "${TOOLCHAIN_DIR}" ] ;
then
    mkdir -p "${TOOLCHAIN_DIR}" || { echo "Failed to create toolchain dir ${TOOLCHAIN_DIR}" ; return 10 ; }
fi



# the name of the nodejs tool directory
NODEJS_DIR_NAME="node-v${VERSION_NODEJS}-win-x64"
# the absolute path of the nodejs tool directory
NODEJS_DIR="${TOOLCHAIN_DIR}/${NODEJS_DIR_NAME}"

# call to download nodejs and npm
if [ ! -d "${NODEJS_DIR}" ] ;
then
    echo "Install Node.js v${VERSION_NODEJS} ..."
    NODEJS_ZIP="${NODEJS_DIR}.zip"
    NODEJS_URL="https://nodejs.org/dist/v${VERSION_NODEJS}/node-v${VERSION_NODEJS}-win-x64.zip"
    curl -s -o "${NODEJS_ZIP}" "${NODEJS_URL}" || { echo "Failed to download node.js" ; return 40 ; } ;

    echo "Unpacking ..."
    # the zip already contains a directory, so simply extract it in the toolchain dir
    unzip -q -d "${TOOLCHAIN_DIR}" "${NODEJS_ZIP}" || { echo "Failed to unpack node.js" ; return 41 ; } ;
    rm "${NODEJS_ZIP}" || { echo "Failed to delete node.js zip" ; } ;
    echo "Done."
    echo
fi

# add nodejs to the path
export PATH="${NODEJS_DIR}/:${PATH}"

if ! which ng > /dev/null 2>&1 ;
then
    echo "Installing Angular ${VERSION_ANGULAR}"
    npm install -g @angular/cli@${VERSION_ANGULAR}
fi


# and finally, display all relevant versions
echo "Following binaries will be used:"
echo
echo "Node.js"
which node ;
node --version ;
echo
echo "npm"
which npm ;
npm -v ;
echo
echo "ng"
which ng
ng version
echo
