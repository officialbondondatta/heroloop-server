import 'dotenv/config'
import express from "express"
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

//MONGODB
const client = new MongoClient(process.env.MONGODB_DB)

export const connectToMongoDB = async () => {
    try {
        await client.connect()
        console.log("You are successfully connected to heroloop mongodb")
        return client
    }
    catch (err) {
        console.dir(err)
        throw err
    }
}
const connection = await connectToMongoDB()
const heroloopdb = connection.db('heroloop')

//collections
const users = heroloopdb.collection('user')
const jobs = heroloopdb.collection('jobs')


//user
app.get('/users', async (req, res) => {
    const result = await users.find({}).toArray()
    res.send(result)
})

//jobs
app.post('/jobs', async (req, res) => {
    const job = req.body
    const result = await jobs.insertOne(job)
    res.send(result)
})

app.get('/jobs', async (req, res) => {
    const query = {}
    if (req.query) {
        if (req.query.employmentType) {
            query.employmentType = req.query.employmentType
        }
        if (req.query.isRemote) {
            query.isRemote = req.query.isRemote === 'true'
        }
        if (req.query.category) {
            query.category = req.query.category
        }
        if (req.query.search) {
            query.$or = [
                { responsibilities: { $regex: req.query.search, $options: 'i' } },
                { company: { $regex: req.query.search, $options: 'i' } },
                { requirements: { $regex: req.query.search, $options: 'i' } },
            ]
        }
    }

    const result = await jobs.find(query).toArray()
    res.send(result)
})

app.get('/jobs/:id', async (req, res) => {
    const id = req.params.id
    const query = { '_id': new ObjectId(id) }
    const result = await jobs.findOne(query)
    res.send(result)
})

app.delete('/jobs/:id', async (req, res) => {
    const id = req.params.id
    const query = { _id: new ObjectId(id) }
    const result = await jobs.deleteOne(query)
    res.send(result)
})



app.get("/", (req, res) => {
    res.send(`Heroloop Server HomePage`)
})






app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})