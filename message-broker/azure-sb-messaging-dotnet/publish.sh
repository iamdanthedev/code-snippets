#!/usr/bin/env bash

set -e

#
#  must be present in the current env:
#  NPM_TOKEN 
#  NUGET_API_KEY
#

export CURRENT_DATE=$(date '+%Y%m%d%H%M%S')
export Version="1.0.0-a$CURRENT_DATE"
export NugetSource="https://api.nuget.org/v3/index.json"

dotnet pack Messaging -o ./out
dotnet nuget push -s "$NugetSource" -k "$NUGET_API_KEY" "out/Bonliva.Messaging.$Version.nupkg"

dotnet pack Messaging.Extensions -o ./out
dotnet nuget push -s "$NugetSource" -k "$NUGET_API_KEY" "out/Bonliva.Messaging.DependencyInjection.$Version.nupkg"

dotnet pack Messaging.Messages -o ./out
dotnet nuget push -s "$NugetSource" -k "$NUGET_API_KEY" "out/Bonliva.Messaging.Messages.$Version.nupkg"

cd "Messaging.Messages.Typescript"
npm install
npm run build
npm version "$Version"
echo _authToken=$NPM_TOKEN >> .npmrc
echo email=ci@bonliva.se >> .npmrc
echo always-auth=true >> .npmrc
npm publish --access public
