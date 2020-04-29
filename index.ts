import { AuthenticationError, ApolloServer, UserInputError, IResolvers } from 'apollo-server'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import config from './utils/config'
import User from './models/user'
import Entry from './models/entry'
import bcrypt from 'bcrypt'

mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)
//NEXT IMPLEMENT LOGIN
//first step users get added with passwordHash
//next step login returns token that user can use
//other methods must use token to authenticate

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
  type Token {
      value: String!
  }

    type User {
        name: String!
        username: String!
        entries: [Entry]!
    }

    type Entry {
        foodDescription: String!
        date: String!
        time: String!
        calories: Int!
    }

    type Query {
        allUsers: [User!]!
        findUser: User!
        userCount: Int!
    }

    type Mutation {
        AddUser (
            name: String!
            username: String!
            password: String!
        ): User
        AddEntry (
            description: String!
            date: String!
            time: Int!
            calories: Int!
        ): Entry
        Login(
            username:String!
            password:String!
        ): Token
    }
`

const resolvers: IResolvers = {
    Query: {
        allUsers: () => User.find({}),
        userCount: () => User.collection.countDocuments(),
    },
    Mutation: {
        Login: async(_root, args) => {
            const user = await User.findOne({username: args.username})
            
            const passwordCorrect = user === null ? false: await bcrypt.compare(args.password, user.passwordHash)
            console.log(passwordCorrect)
            if (!(user && passwordCorrect)){
                throw new AuthenticationError("Invalid Password or User")
            }
            else{
                const userToken = {
                    username: user.username,
                    id: user._id
                }
            }

        
        },
        AddUser: async (_root: unknown, args: { name: string; username: string; password: string }) => {
            //once authentication is done, 
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(args.password, saltRounds)
            const user = new User({name: args.name, username: args.username, passwordHash: passwordHash, entries:[]})
            try {
                const response = await user.save()
                return response
            }
            catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }
        },
        AddEntry: async (_root: unknown, args: {description: string; date: string; time: number; calories: number}) => {
            const entry = new Entry({description: args.description, date: args.date, time: args.time, calories: args.calories})
            try {
                const response = await entry.save()
                return response
            }
            catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs, 
    resolvers, 
    context: async ({req}) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')){
            const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET)
            const currentUser = await User.findById(decodedToken.id)
            return {currentUser}
        }
        return null
    }
})


server.listen().then(({url}) => {
    console.log(`Server running at ${url}`)
})