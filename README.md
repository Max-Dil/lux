# lux
 lux engine

Game engine for 2D games

async, await Methods:
data.js:
- compress(format, input)
- decompress(format, input) 
- hash(algorithm, input)

filesystem.js:
- read(filepath, type)
- write(filepath, data)
- append(filepath, data)
- createDirectory(path)
- getDirectoryItems(path)
- getInfo(path, filtertype)
- isDirectory(path)
- isFile(path)
- mount(archive, mountpoint, jointed)
- unmount(archive)

font.js:
- newRasterizer(filename, size, hinting)
- newTrueTypeRasterizer(filename, size, hinting)
- newBMFontRasterizer(imageFilename, dataFilename)

graphics.js:
- setNewFont(filename, size)
- newImage(src)
- newVideo(filename)

image.js:
- newCompressedData(filepath)

sound.js:
- newDecoder(filepath)
- newSource(source)

system.js:
- getClipboardText()
- setClipboardText(text)
- getPowerInfo()

video.js:
- newVideoStream(filename)

timer.js:
- sleep(seconds)

window.js:
- showMessageBox(title, message, type, buttons)