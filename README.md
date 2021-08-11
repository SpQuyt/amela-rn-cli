# amela-rn-cli
![npm version](https://img.shields.io/npm/v/amela-rn-cli.svg) ![Supports Android, iOS, MacOS, and Windows](https://img.shields.io/badge/platforms-android%20|%20ios|%20macos|%20windows-lightgrey.svg) ![MIT License](https://img.shields.io/npm/l/amela-rn-cli.svg)

Amela's react-native CLI.
# A. Purposes
* Automatically creating react-native project from template [AMELA React Native Template](https://github.com/amela-technology/react-native-templet-v1)
* Automatically dividing project into 3 environments: **dev**, **staging** and **product**
* Automatically changing app's icon without going through many steps!

# B. Notes
* Work better on macOS and Hackintosh, Windows can be buggy sometimes.
# Getting started
`$ npm install -g amela-rn-cli`

# C. Features
## 1. Create a new project
* Get inside folder that you want to create project.

* Run command line `$ amela-rn-cli`.

![](assetsReadme/newProject/16.23.52.png)

* Choose mode 1 - **Create a new project**.

* Type in ProjectName, should be lowercase, don't have special characters except hyphen "-".

![](assetsReadme/newProject/16.24.36.png)

* Type in ProjectDisplayName.

![](assetsReadme/newProject/16.24.48.png)

* Type in ProjectAppCode, should be lowercase, maximum 3 characters.

![](assetsReadme/newProject/16.25.07.png)

* Type in repository's remote URL (if you have one)

![](assetsReadme/newProject/16.25.15.png)

* Waiting...

![](assetsReadme/newProject/16.28.34.png)

![](assetsReadme/newProject/16.30.32.png)

![](assetsReadme/newProject/16.30.41.png)

* Try running on both Android + iOS and enjoy!

![](assetsReadme/newProject/16.31.18.png)

* **Note: Project will have default AMELA icon**.
---
## 2. Change app's icon
* Get inside folder of project you want to change icon.

![](assetsReadme/appIcon/16.37.27.png)

* Add an image to this folder (jpeg, jpg, png). For example, I added **icon.jpeg**.

![](assetsReadme/appIcon/16.40.23.png)

* Run command line `$ amela-rn-cli`.

* Choose mode 2 - **Change app icon (Must be inside a react-native project + Have icon image inside that project)**.

![](assetsReadme/appIcon/16.39.56.png)

* Type in the name of the image file for icon. For example, I typed **icon.jpeg**.

![](assetsReadme/appIcon/16.40.09.png)

* Type in the name of folder inside **ios** folder. For example, I found that folder's name is "demogitlab", so I typed **demogitlab**.

![](assetsReadme/appIcon/16.41.09.png)

![](assetsReadme/appIcon/16.41.16.png)

* Waiting and enjoy!

![](assetsReadme/appIcon/16.41.29.png)

![](assetsReadme/appIcon/16.41.45.png)