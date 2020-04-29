import 'dotenv/config'

declare const process: { env: { [key: string]: string } };
const PORT = process.env.PORT
const MONGODB_URI = process.env.mongoUrl
const JWT_SECRET = process.env.jwt


export default {
    PORT, MONGODB_URI, JWT_SECRET
}

