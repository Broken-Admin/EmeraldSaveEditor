import fs from "fs"

export function ProcessFileToBuffer(filename: string) {
    let fileBuffer = fs.readFileSync(filename)
    let byteBuffer = new Uint8Array(fileBuffer.buffer)
    return byteBuffer
}

// Taking an Uint8Array as input
// Inteprets it as a single number in little endian 
// Little-endian, the smaller places are higher in memory
// Uint8Array([0x20, 0x10]) is equ to LE 0x1020
export function LEBytesToNumber(bytes: Uint8Array) {
    let val = 0
    for (let i = 0; i < bytes.length; i++) {
        val += Number(bytes[i]) << (i * 8);
    }
    return val
}