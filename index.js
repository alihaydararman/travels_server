const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware-------------
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ecgrw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// ------------------------------------------------------

async function run() {
    try {
        await client.connect();
        const database = client.db("Explore_travel");
        const travelsCollection = database.collection("travels");
        const usersCollection = database.collection('users');
        console.log('connecting')

        // GET all services----------------------
        app.get('/travels', async (req, res) => {
            const travels = await travelsCollection.find({}).toArray();
            res.send(travels);
        })
        app.post('/travelPost', async (req, res) => {
            const service = req.body;
            const result = await travelsCollection.insertOne(service)
            res.send(result)
        })

        //get travel--------------------
        app.get('/travel/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const travel = await travelsCollection.findOne(query)
            res.send(travel)
        })
        // update travel-------------------
        app.put("/UpdateTravelsFrom/:id", async (req, res) => {
            const id = req.params.id;
            const updateTravel = req.body;
            const filter = { _id: ObjectId(id) };

            travelsCollection.updateOne(filter, {
                $set: {
                    title: updateTravel?.title,
                    description: updateTravel?.description,
                    price: updateTravel?.price,
                    img: updateTravel?.img,
                    category: updateTravel?.category,
                    info: updateTravel?.info,
                    address: updateTravel?.address,
                    rating: updateTravel?.rating
                },
            })
                .then((result) => {
                    res.send(result);
                });
        });

        // delete travels ===========================
        app.delete('/travelDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await travelsCollection.deleteOne(query);
            res.send(result)

        })
        // get admin-----------------------
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAmin = false;
            if (user?.role === "admin") {
                isAmin = true;
            }
            res.json({ admin: isAmin })
        })

        // approve api-------------------
        app.put("/approve/:id", async (req, res) => {
            const id = req.params.id;
            const role = req.body.role;
            console.log(role)
            const filter = { _id: ObjectId(id) };
            await travelsCollection.updateOne(filter, {
                $set: {
                    role: role,

                },
            })
                .then((result) => {
                    res.send(result);
                });

        });

        // save to database user --------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
            // console.log(user)
        })
        // update user=======================
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        // admin add -------------------- verifyToken,
        app.put('/users/admin', async (req, res) => {

            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);
// ------------------------------------------------------

app.get('/', (req, res) => {
    res.send('Travels World running');
})

app.listen(port, () => {
    console.log('Travels World running', port)
})