/*
    currentgaversion = "8.0.0";
*/
var propParser = require('properties-parser');
var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');
var headlessBuildProp = "HeadlessBuild.properties"
var headlessBuildPropPath = path.resolve(headlessBuildProp);
var clean= false;
var buildProps = loadProperties(headlessBuildPropPath);
var spawn = require('child_process').spawn;
var projectName = readProp("project.name");
if(projectName==null||projectName===""){
    throw new BuildException("Set the project name in HeadlessBuild.properties");
}
var projectLocation = __dirname;

var platforms = {
    "iphone": "iphone",
    "android": "android",
    "windowsphone8": "windowsphone8",
    "ipad": "ipad",
    "androidtablet": "androidtablet",
    "windowsphone81s": "windowsphone81s",
    "windowsphone10": "windowsphone10",
    spa: {
        "iphone": "iphone",
        "android": "android",
        "blackberry": "blackberry",
        "winphone": "winphone",
        "ipad": "ipad",
        "androidtablet": "androidtablet",
        "windowstablet": "windowstablet",
        hybrid: {
            "blackberry": "blackberry"
        }
    },
    "windows8.1": "windows8.1",
    "windows10": "windows10",
    "desktop_kiosk": "desktop_kiosk",
    "desktopweb": "desktopweb"
}

var config = {
    projectLocation: projectLocation,
    workspace:path.dirname(projectLocation),
    projectName:projectName,
    selectedPlatforms:readProp("selectedPlatforms"),
    pluginLocation:readProp("plugin.dir")
};

function BuildException(message) {
   this.message = message;
   this.name = 'BuildException';
}

function validatingProp(propertyName){
    if(config[propertyName]==null||config[propertyName]===""){
        throw new BuildException("Set the "+propertyName+" in HeadlessBuild.properties");
    }
    if(propertyName === "selectedPlatforms" && (config[propertyName]).length <= 0){
        throw new BuildException("Set at least one platform to be build, as true, in HeadlessBuild.properties");
    }
}

function setCleanFlag(){
    var arguments = process.argv.slice(2);
    for(var i in arguments){
        var arg = arguments[i];
        if(arg==="-clean"){
            clean =true;
            break;
        }
    }
 }

function loadProperties(PropPath){
    var result = fs.readFileSync(PropPath);
    let props = propParser.parse(result);
    for(var key in props){
        if(typeof props[key] === 'string'){
            props[key] = props[key].trim();
        }
    }
    return props;
}

function readProp(propertyName){
    if(propertyName==="selectedPlatforms"){
        var platforms = getSelectedPlatforms(buildProps);
        return platforms;
    }
    else {
        var res = buildProps[propertyName];
        return res;
    }
}

function getSelectedPlatforms(props) {
    if (platforms && props) {
        var arrayOfSelectedPlatforms = filterSelectedPlats(platforms, props, '');
        if(props["universal.iphone"] !== undefined  && props["universal.iphone"] == 'true'){
            if(!(arrayOfSelectedPlatforms.indexOf("iphone") >= 0))
                arrayOfSelectedPlatforms.push("iphone");
            if(!(arrayOfSelectedPlatforms.indexOf("ipad") >= 0))
                arrayOfSelectedPlatforms.push("ipad");
        }
        return arrayOfSelectedPlatforms;
        //return filterSelectedPlats(platforms, props, '');
    }
}

function filterSelectedPlats(platforms, properties, parent) {
    var selectedPlatforms = [];
    if (platforms && properties) {
        let platSel;
        let platName;
        for (let plat in platforms) {
            platName = platforms[plat];
            if (typeof platName === 'string') {
                platSel = properties[parent + platName];
                if (platSel && platSel.trim() == 'true') {
                    selectedPlatforms.push(parent + platName);
                }
            } else if (typeof platName === 'object') {
                let prefix = (parent ? (parent + ".") : '') + plat +
                    ".";
                selectedPlatforms = selectedPlatforms.concat(
                    filterSelectedPlats(platName,
                        properties, prefix));
            }
        }
    }
    return selectedPlatforms;
}
function extract(sourcePath,destinationPath){
    if(!(fs.existsSync(destinationPath))){
        fs.mkdirSync(destinationPath);
    }
    console.log("Extracting "+path.basename(sourcePath));
    var unzipper = new AdmZip(sourcePath)
    unzipper.extractAllTo(destinationPath, true);
    console.log("Extracted to "+ destinationPath)
}

function copyFolders(sourcePath,destinationPath){
    var files = [];

    var targetFolder = path.join( destinationPath, path.basename( sourcePath ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }
    //copy
    if ( fs.lstatSync( sourcePath ).isDirectory() ) {
        files = fs.readdirSync( sourcePath );
        files.forEach( function ( file ) {
            var curSource = path.join( sourcePath, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolders( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

function copyFileSync( source, target ) {
    var targetFile = target;
    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function deleteFolder(folderpath){
    var deleteFolderRecursive = function(folderpath) {
        if( fs.existsSync(folderpath) ) {
            fs.readdirSync(folderpath).forEach(function(file,index){
                var curPath = path.resolve(folderpath ,file);
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                }
                else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            try{
                fs.rmdirSync(folderpath);
            }
            catch(err){
                if(err.code == 'ENOTEMPTY')
                    deleteFolderRecursive(folderpath);
            }
        }
    };
    deleteFolderRecursive(folderpath);
}

function extractPlugin(sourcePath,projectLocation){
    var destinationPath = path.dirname(projectLocation)+path.sep+"bundles";
    if(!(fs.existsSync(destinationPath))){
        fs.mkdirSync(destinationPath);
    }
    else{
        console.log("Cleaning the bundles folder...");
        deleteFolder(destinationPath)
        fs.mkdirSync(destinationPath);
    }
    var files = fs.readdirSync(sourcePath);
    var versionMap ="";
    var pluginversions = path.resolve(destinationPath, "pluginversions.properties");
    files.forEach(function(file, index){
        var fromPath = path.join(sourcePath, file);
        if(path.extname(fromPath)===(".jar")){
            var fileName = path.basename(fromPath,".jar");
            var pluginName = fileName.substring(0,fileName.indexOf('_'));
            var versionName = fileName.substring(fileName.indexOf('_')+1);
            if(pluginName.includes("keditor")){
                versionMap = versionMap.concat("\nKony_Studio="+versionName);
            }
            if(pluginName.includes("com.kony.ios")){
                versionMap = versionMap.concat("\niOS_Plugin="+versionName);
            }
            if(pluginName.includes("com.pat.android")){
                versionMap = versionMap.concat("\nAndroid="+versionName);
            }
            if(pluginName.includes("com.pat.tabrcandroid")){
                versionMap = versionMap.concat("\nTablet_Android="+versionName);
            }
            if(pluginName.includes("com.kony.spa")){
                versionMap = versionMap.concat("\nSPA="+versionName);
            }
            if(pluginName.includes("com.kony.webcommons")){
                versionMap = versionMap.concat("\nKony_Web_Commons="+versionName);
            }
            if(pluginName.includes("com.kony.thirdparty.jars")){
                versionMap = versionMap.concat("\nThird_Party_Jars_Plug-in="+versionName);
            }
            if(pluginName.includes("com.kony.desktopweb")){
                versionMap = versionMap.concat("\nKony_Desktop_Web="+versionName);
            }
            if(pluginName.includes("com.kony.cloudmiddleware")){
                versionMap = versionMap.concat("\nCloudMiddlewarePlugin="+versionName);
            }
            if(pluginName.includes("com.kony.cloudthirdparty")){
                versionMap = versionMap.concat("\nCloudThirdPartyPlugin="+versionName);
            }
            if(pluginName.includes("com.kony.mobile.fabric.client.sdk")){
                versionMap = versionMap.concat("\nMobileFabric_Client_SDK="+versionName);
            }
            var toPath = path.join(destinationPath, pluginName);
            extract(fromPath,toPath);
        }
    });
    fs.writeFile(pluginversions,versionMap, (err) => {
        if (err)
            throw err;
        console.log('pluginversions.properties file has been saved in bundlesfolder');
    });
}

function prebuild(){
    setCleanFlag();
    var projectLocation = config.projectLocation;
    var bundlesLocation = path.resolve(config.workspace,"bundles");
    validatingProp("selectedPlatforms");

    if(clean || !(fs.existsSync(bundlesLocation))){
        validatingProp("pluginLocation");
        console.log("Extracting plugins...");
        extractPlugin(config.pluginLocation,projectLocation);
    }

    var studioViz_plugin = "com.kony.studio.viz.core";
    var plugins = fs.readdirSync(bundlesLocation);
    if(plugins.toString().includes(studioViz_plugin)){
        var buildLocation="";
        var configString = JSON.stringify(config);
        for(var i in plugins){
            if(plugins[i].startsWith(studioViz_plugin)){
                var konywebstudio = path.resolve(bundlesLocation, plugins[i],"konywebstudio");
                buildLocation = path.resolve(konywebstudio,"kbuild","BuildManager.js");
                var result = spawn('node',[buildLocation, "console",config.workspace,"","--NODE_APP_INSTANCE=vide",configString],{cwd:konywebstudio});
                result.stdout.on('data' , function(data){
                    console.log(data.toString());
                });
                result.stderr.on('data' , function(data){
                    console.log(data.toString());
                });
            }
        }
    }
    else
       throw new BuildException(studioViz_plugin +" plugin is missing");
}

prebuild();
