import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db;

async function connectDB() {
    if (db) return db;
    
    await client.connect();
    db = client.db('deepseek');
    return db;
}

export async function getUsers() {
    const db = await connectDB();
    return db.collection('users');
}

export async function getChats() {
    const db = await connectDB();
    return db.collection('chat_history');
} 

export {client};