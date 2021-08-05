const fs = require("fs");
const path = require("path");
const _ = require("lodash");


const srcPath = path.resolve(__dirname, "src/index.ts");
const eventsPath = path.resolve(__dirname, "src/events");

try {
    fs.unlinkSync(path.resolve(eventsPath, "Object.ts"));
} catch (e) {}

const eventFiles = fs.readdirSync(eventsPath);

const index = eventFiles.map(x => {
    const fileName = _.upperFirst(x.replace(".ts", ""));
    return `export * from "./events/${fileName}";`;
}).join("\n");

fs.writeFileSync(srcPath, index);

eventFiles.filter(x => x.includes("Event")).forEach(eventFile => {
    console.log(eventFile);
    
    const filePath = path.resolve(eventsPath, eventFile);
    // const newFilePath = path.resolve(eventsPath, _.upperFirst(eventFile));
    
    const content = fs.readFileSync(filePath).toString();
    
    const header = getHeader(content);
    const interfaceCode = extractItemCode(content);
    const className = _.upperFirst(getItemName(content));
    const interfaceName = "I" + className;
    const classContent = interfaceToClass(className, interfaceName, interfaceCode);
    const updatedInterfaceCode = getInterfaceCode(className, interfaceCode);
    
    const result = getFileResult(header, updatedInterfaceCode, classContent);
    
    fs.writeFileSync(filePath, result);
});


function getFileResult(header, interfaceCode, classCode) {
    return `
/** auto-generated */
${header}
import { Message } from "../Message";
    
${interfaceCode}

${classCode}
`
}

function getInterfaceCode(className, code) {
    return `
export interface I${className} {
    ${code}
}
    `;
}

function getHeader(code) {
    return code.match(/^(.+)export class/s)[1]
}

function interfaceToClass(className, interfaceName, value) {
    const fields = value.replace(/export.+{\n/, "").replace("}", "")
    
    return `
export class ${className} extends Message implements ${interfaceName} {
${fields}


    constructor(eventData: ${interfaceName}) {
        super();
        Object.assign(this, eventData);
    }
}
`;
    
}

function getItemName(value) {
    return value.match(/class\s([a-zA-Z0-9_]+)\s{/)[1]
}

function extractItemCode(value) {
    return value.match(/export class .+ {(.+)}/s)[1]
}