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