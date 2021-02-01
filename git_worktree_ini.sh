#!/bin/bash

## we have to be in the project root
CURRENT_DIR="${PWD}"
BRANCH_NAME="code-server-ec2"
#BRANCH_DIR="${BRANCH_NAME}"
BRANCH_NAME="${1:-code-server-ec2}"

echo "${BRANCH_DIR}" >> .gitignore
git checkout --orphan ${BRANCH_NAME}
git reset --hard
git commit --allow-empty -m "Initializing '${BRANCH_NAME}' branch"
git push origin ${BRANCH_NAME}
# switch to main branch
git checkout main

