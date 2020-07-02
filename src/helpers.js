export function isImage(file) {
    if (file.type.split('/')[0] === 'image') {
        return true;
    }
}

export function convertBytesToMbsOrKbs(filesize) {
    let size = '';
    // I know, not technically correct...
    if (filesize >= 1000000) {
        size = (filesize / 1000000) + ' megabytes';
    } else if (filesize >= 1000) {
        size = (filesize / 1000) + ' kilobytes';
    } else {
        size = filesize + ' bytes';
    }
    return size;
}

export async function createFileFromUrl(url) {
    const response = await fetch(url);
    const data = await response.blob();
    const metadata = {type: data.type};
    const filename = url.replace(/\?.+/, '').split('/').pop();
    return new File([data], filename, metadata);
}

/*
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event?.target?.result);
        };
        reader.onerror = (event) => {
            reader.abort();
            reject(event);
        };
        reader.readAsDataURL(file);
    });
}
*/

export function parseFile (file, callback) {
    const fileSize   = file.size;
    const chunkSize  = 64 * 1024; // bytes
    const offset     = 0;
    const self       = this; // we need a reference to the current object
    let chunkReaderBlock = null;

    const readEventHandler = evt => {
        if (evt.target.error == null) {
            offset += evt.target.result.length;
            callback(evt.target.result); // callback for handling read chunk
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            console.log("Done reading file");
            return;
        }

        // of to the next chunk
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = (_offset, length, _file) => {
        const r = new FileReader();
        const blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsText(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

export function readFile(file) {
    return new Promise((resolve, reject) => {
        parseFile(file, result => resolve(result))
    });
}
