const express = require('express')
const cors = require('cors')
const nodemailer = require("nodemailer");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 80
const app = express()
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.MONGO_ADMIN}:${process.env.MONGO_PASS}@cluster0.c1tum.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function mailSender(body) {
    let transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAILGUN_USER,
            pass: process.env.MAILGUN_PASS
        },
    });

    let info = await transporter.sendMail({
        from: 'md.alamin133232@gmail.com',
        to: "vijayalamin@gmail.com",
        subject: "Here's Your Row Data",
        html: `<pre>${JSON.stringify(body)}</pre>`
        ,
    });

    return info.messageId

}


async function run() {
    try {
        await client.connect();
        const hobbyCollection = client.db("hobbyDB").collection("hobby")

        app.get("/hobby", async (req, res) => {
            let result;
            if (req.query.latest === 'true') {
                result = await hobbyCollection.find().sort({ $natural: 1 }).toArray()
            }
            else {
                result = await hobbyCollection.find().sort({ $natural: -1 }).toArray()
            }
            res.send(result)
        })
        app.get("/hobby/:id", async (req, res) => {
            result = await hobbyCollection.findOne({ _id: ObjectId(req.params.id) })
            res.send(result)
        })
        app.post("/hobby", async (req, res) => {
            const result = await hobbyCollection.insertOne(req.body)
            res.send(result)
        })
        app.put("/hobby/:id", async (req, res) => {
            const id = req.params.id
            const updateDoc = {
                $set: {
                    hobby: req.body.hobby,
                    phone: req.body.phone,
                    email: req.body.email,
                    name: req.body.name,
                }
            }
            const result = await hobbyCollection.updateOne({ _id: ObjectId(id) }, updateDoc, { upsert: true })
            res.send(result)
        })
        app.delete("/hobby/:id", async (req, res) => {
            const result = await hobbyCollection.deleteOne({ _id: ObjectId(req.params.id) })
            res.send(result)
        })

        app.post("/mail", async (req, res) => {
            mailSender(req.body).catch(console.error)
        })
    } finally {
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World! hobby server is up n runnin')
})

app.listen(port)