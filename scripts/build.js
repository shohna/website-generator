const fse = require('fs-extra');
const path = require('path');
const { promisify } = require('util');
const ejs = require('ejs');
const glob = require('glob').glob;
const config = require('../site.config');

// Promisify the correct functions
const ejsRenderFile = promisify(ejs.renderFile);

const srcPath = './src'
const distPath = './public'

// clear destination folder
fse.emptyDirSync(distPath)

// copy assets folder
fse.copy(`${srcPath}/assets`, `${distPath}/assets`)

// read page templates
glob('**/*.ejs', { cwd: `${srcPath}/pages` })
  .then((files) => {
    
    files.forEach((file) => {
      const fileData = path.parse(file)
      const destPath = path.join(distPath, fileData.dir)
      
      // create destination directory
      fse
        .mkdirs(destPath)
        .then(() => {
          // render page
          return ejsRenderFile(
            `${srcPath}/pages/${file}`,
            Object.assign({}, config)
          )
        })
        .then((pageContents) => {
          // render layout with page contents
          return ejsRenderFile(
            `${srcPath}/layout.ejs`,
            Object.assign({}, config, { body: pageContents })
          )
        })
        .then((layoutContent) => {
          // save the html file
          fse.writeFile(`${destPath}/${fileData.name}.html`, layoutContent)
        })
        .catch((err) => {
          console.error(err)
        })
    })
  })
  .catch((err) => {
    console.error(err)
  })