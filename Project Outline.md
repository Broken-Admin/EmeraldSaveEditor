## Source Code
<hr/>

### index.ts
* Implement a user interface with options to
    - To dump each section (of the current save) as a raw data file
    - Display section in specific bytecode, option to set endianness
    - To execute code using an `eval`
        * Primarily so that (instance) variables can be edited on-the-fly

* Implement a user interface to modify the file and
    - Implement code to dump the raw save file again, changing checksums if data was modified and validating checksums as well
        * `Buffer.from` to create a buffer for a file from a `Uint8Array` instance, where `Buffer.from(data)` is raw data to write in `fs.writeFileSync(path, rawData, options)`
    - Handle flags
        * Fetch flags
        * Clear and set flags

### save.ts
* Continue implementing functions to modify and update the flags or variables
    - Implement an instance-specific variable that defines the offset of flags or variables in their section
* 

## Standard Emerald Documentation
<hr/>

### Flags
* Flags begin at 0x2f0 from the start of section 2
* Single-bit, complicated math to calculate which byte to flip
* Trainer flags occupy 0x500 - 0x85F, the last 9 of which are unused

### Variables
* Variables begin at 0x41C from the start of section 2, the end of the flags section