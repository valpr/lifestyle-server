import 'dotenv/config'

declare const process: { env: { [key: string]: string } };
const PORT = process.env.PORT
const MONGODB_URI = process.env.mongoUrl


export default {
    PORT, MONGODB_URI
}

