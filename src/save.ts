import { LEBytesToNumber } from "./memory"

export const enum SaveDataSections {
    // Trainer info: contains data about the player's name, gender, appearance, and other attributes.
    TrainerInfo = 0,
    // Team / items: contains data about the player's Pokémon and items.
    TeamItems = 1,
    // Game state: contains data about the current state of the game, including the player's location and progress.
    GameState = 2,
    // Misc data: contains miscellaneous data that doesn't fit into other categories.
    MiscData = 3,
    // Rival info: contains data about the player's rival.
    RivalInfo = 4,
    // PC buffer A-H: contain data about Pokémon that have been deposited in the PC.
    PCBufferA = 5,
    PCBufferB = 6,
    PCBufferC = 7,
    PCBufferD = 8,
    PCBufferE = 9,
    PCBufferF = 10,
    PCBufferG = 11,
    PCBufferH = 12,
    // PC buffer I: contains miscellaneous data that doesn't fit into other categories.
    PCBufferI = 13,
}

// Various offset or memory sizes
export class MemoryValues {
    // Size of a section in bytes
    static sectionSize = 0x1000
    // Number of sections in a save
    static sectionsNum = 14
    // Size of a save
    static mainSize = this.sectionSize * this.sectionsNum
    // Save Offsets
    static saveOffsets = [0x0000, this.mainSize]

    // Sum of 0 to 13, sum of all section ids
    static SectionIdSum = 91

    constructor() {
        if (this instanceof MemoryValues) {
            throw 'A static class cannot be instantiated.';
        }
    }
}

// Entire raw save data from file
export class RawSave {

    // Save File Data
    rawData: Uint8Array
    saveA: GameSave
    saveB: GameSave
    activeSave: GameSave
    activeSaveIndex: number = 0 
    saveArray: GameSave[]

    /*
    * Every time the game is saved the order of the sections gets rotated once.
    * For example, the first-ever time the game is saved,
    * the sections are saved in the order 13, 0, 1, ..., 12. 
    * The next time the game gets saved these sections will be rotated by 1: 12, 13, 0, 1, ..., 11.
    * The sections only ever get rotated and never scrambled so they will always remain in the same
    * order, but may begin at different points.
    */

    constructor(rawData: Uint8Array) {
        this.rawData = rawData
        this.saveA = new GameSave(this.FetchSave(0))
        this.saveB = new GameSave(this.FetchSave(1))
        // This does some very funny stuff with assignment, but
        // this essentially does some sketchy pass-as-reference stuff,
        // and then assigns activeSave to a reference of one of the above variables
        this.activeSave = this.FetchActiveSave(this.saveA, this.saveB)
        this.saveArray = [this.saveA, this.saveB]
    }

    // Fetches a save given the raw save file and the save index
    FetchSave(saveIndex: number): Uint8Array {
        let offset = MemoryValues.saveOffsets[saveIndex]
        return this.rawData.slice(offset, offset + MemoryValues.mainSize)
    }

    // Detemine which save block is most recent
    // Return the data array of the most recent save
    // Does not return a value, assigns the activeSave
    FetchActiveSave(saveA: GameSave, saveB: GameSave): GameSave {
        // The most recent save will have the higher number

        let saveNumberA = saveA.FetchSaveNumber()
        let saveNumberB = saveB.FetchSaveNumber()

        // The activeSaveIndex defaults to 0 as instantiated

        if(saveNumberA > saveNumberB) return(saveA)
        if(saveNumberB > saveNumberB) {
            this.activeSaveIndex = 1
            return(saveB)
        }
        return(saveA)
        // Assign Active to one of the saves, direct assignment of arrays is done by reference rather
        // than by value. If active is modified then the other save is modified. This cuts down
        // on some possible complexity. Similar to C pointers, except not directly stated
    }

    // TODO:
    // CalculateSectionChecksum(saveIndex: number, sectionIndex: number)
    // UpdateSectionChecksum(saveIndex: number, sectionIndex: number)
    // UpdateRawSave()
    // ExportRawSave(filename: string)
        // Write some code to dump each section as a raw data file...
        // Buffer.from to create a buffer for a file
        // Where Buffer.from(data) is data to write in
        // fs.writeFileSync(path, data, options)
}

// Single save, (0x1000 * 14) bytes in size
export class GameSave {

    saveData: Uint8Array | any

    constructor(saveData: Uint8Array) {
        if(!this.AllSectionsPresent()) throw "Invalid save data provided for instantiation of GameSave"
        // There probably is some code I could write in order to
        // confirm that this is a valid save, but for my use
        // case I know for a fact that this save is valid
        this.saveData = saveData
    }

    // Sections
    
    AllSectionsPresent(): boolean {
        let sum = 0
        for (let sectionIndex = 0; sectionIndex < MemoryValues.sectionsNum; sectionIndex++) {
            sum += this.FetchSectionId(sectionIndex)
        }
        console.log(sum == MemoryValues.SectionIdSum ? "All sections are present" : "Not all sections are present")
        return sum == MemoryValues.SectionIdSum
    }

    FetchSectionOffset(sectionIndex: number): number {
        return sectionIndex * MemoryValues.sectionSize
    }

    FetchSection(sectionIndex: number): Uint8Array {
        let sectionOffset = this.FetchSectionOffset(sectionIndex)
        return this.saveData.slice(sectionOffset, sectionOffset + MemoryValues.sectionSize)
    }

    FetchSectionFooter(sectionIndex: number): Uint8Array {
        // Footer is located in the last 12 bytes of the save
        return this.FetchSection(sectionIndex).slice(-12)
    }

    FetchSectionId(sectionIndex: number): number {
        // Fetches the id of a section by index
        return LEBytesToNumber(
            this.FetchSectionFooter(sectionIndex)
            .slice(0,2)
        )
    }

    FetchSaveNumber(): number {
        // Save number is the "save index"
        // the number of the saves
        // The most recent save will have the higher number

        // Fetch the footer of the 14th section (index 13) in respective saves
        // The last 4 bytes are a little-endian representation of
        // the number of times a save block has been saved to
        return LEBytesToNumber(this.FetchSection(13).slice(-4))
    }

    // Flags
    // Trainer Flags
    // Trainer flags occupy 0x500 - 0x85F, the last 9 of which are unused

    // Confirms that the offset is 16 bits or less
    CheckFlagIndexInRange(flagIndex: number): boolean {
        if(flagIndex > 0xFFFF) throw "Outside of the range of possible flags."
        return true
    }

    GetFlagByteOffset(flagIndex: number): number {
        // This is probably also possible with a bitwise operation
        // but that's irrelevant and harder to read
        // Assume zero-indexed
        return Math.floor(flagIndex / 8)
    }

    // Calculates a "bit selector" that allows choosing a specific bit
    // in a byte.
    // It can be seen as a bitshift of the mod 8 of flagIndex or
    // 1 << (flagIndex % 8)
    // flagIndex mod 8 and little-endian allows for a clever bitshift
    GetFlagBitSelector(flagIndex: number): number {
        return 1 << (flagIndex & 7)
    }

    // Fetches flag as boolean
    GetFlag(flagIndex: number): boolean {
        this.CheckFlagIndexInRange(flagIndex)
        let byteOffset = this.GetFlagByteOffset(flagIndex)
        let bitSelector = this.GetFlagBitSelector(flagIndex)
        // Any nonzero number evaluates is "truthy", and evaluates to
        // true when typecast
        return Boolean(this.saveData[byteOffset] & bitSelector)
    }

    SetFlag(flagIndex: number): void {
        this.CheckFlagIndexInRange(flagIndex)
        let byteOffset = this.GetFlagByteOffset(flagIndex)
        let bitSelector = this.GetFlagBitSelector(flagIndex)
        this.saveData[byteOffset] |= bitSelector
    }

    ClearFlag(flagIndex: number): void {
        this.CheckFlagIndexInRange(flagIndex)
        let byteOffset = this.GetFlagByteOffset(flagIndex)
        let bitSelector = ~(this.GetFlagBitSelector(flagIndex))
        // Bitwise AND assignment with not, keeps all set
        // bits in the byte except the flag
        this.saveData[byteOffset] &= ~bitSelector
    }

    // Variables

    GetVariable(variableIndex: number) {
        if(variableIndex > 0xFFFF) throw "Outside the scope of possible variables"
    }

}