// read from all of Lox files

import { readdir, readFile} from 'fs/promises';
import path from 'path';
import async, {eachSeries, forEach} from 'async';
import {fileURLToPath} from 'url';
import VM from "../3vm.js";


let directories = ['assignment'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function processEachFile(filePath){
    const data = await readFile(filePath);
    const sourceCode = data.toString();
    const vm = new VM();
    vm.interpret(sourceCode);
    console.log(`//////end ${path.basename(filePath)} test///////`);
}

// processEachFile('./assignment/associativity.lox').then(output => {
//     console.log("Everything is awesome!");
// })

async function processEachDir (dir){
    try {
        const currentPath = `${__dirname}/${dir}`;
        const allfiles = await readdir(currentPath);
        console.log(`Process ${dir} folder.`);
        console.log("//////////");
        // console.log(allfiles);
        for (const fileName of allfiles){
            const filePath = `${currentPath}/${fileName}`
            console.log(`Process ${fileName} file.`);
            console.log("//////////")
            await processEachFile(filePath)

        }
    } catch (err){
        console.error(err);
    }
}

// loop through each directory
forEach(directories, processEachDir);


//ran each file one after another

//read from each output and output a test file for each