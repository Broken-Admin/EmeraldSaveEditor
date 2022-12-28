import fs from "fs"
import { GameSave, RawSave, SaveDataSections } from "./save"
import { LEBytesToNumber, ProcessFileToBuffer } from "./memory"

const args = process.argv.slice(2)
let saveFile = fs.readFileSync(args[0])
let rawData = new Uint8Array(saveFile.buffer)

let rawSave = new RawSave(rawData)

for(let saveIndex = 0; saveIndex < 2; saveIndex++) {
    console.log(`Save ${saveIndex == 0 ? "A" : "B"}`)
    for(let sectionIndex = 0; sectionIndex < 14; sectionIndex++) {
        console.log(rawSave.saveArray[saveIndex].FetchSectionId(sectionIndex))
    }
}

// Write some code to dump each section as a raw data file...
// Buffer.from to create a buffer for a file
// Where Buffer.from(data) is data to write in
// fs.writeFileSync(path, data, options)

// Using readline to only dump a specific section at a time and have other options such as just
// displaying the section