const express = require('express')
const fs = require('fs')
const multer = require('multer')
const  { createWorker } = require('tesseract.js');

const worker = createWorker({
  logger: m => console.log(m)
});

async function recognize(image){
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(image);
    console.log(text);
    await worker.terminate();
    return text;
}

const  storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: storage}).single('photo')

const PORT = process.env.PORT || 5000

const app = express()

// // //Parse URL-encoded bodies ( HTML FORMS )
// app.use(express.urlencoded())
// // //Parse JSON bodies ( API CLIENTS )
// app.use(express.json())

app.set('view engine', 'ejs')

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/recognize', (req, res) => {
    console.log('Recognizing a photo')
    upload(req, res, cb => {
       fs.readFile('./uploads/'+req.file.originalname, async (err, data) => {
           if(err) return console.log('This.is error', err)

            text = await recognize(data)
            res.send(text)
            fs.unlink('./uploads/'+req.file.originalname, err => {
                console.log(err)
            })
       })
    })
})

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})