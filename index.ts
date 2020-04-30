import { ApolloServer, UserInputError, IResolvers } from 'apollo-server'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import config from './utils/config'
import User from './models/user'
import Entry from './models/entry'
import { Token } from './types'

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
        firstname: String!
        lastname: String!
        username: String!
        entries: [Entry]!
        gender: String!
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
            firstname: String!
            lastname: String!
            username: String!
            password: String!
            gender: Int!
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
        Login: (_root, _args) => {
            return null //TODO
        },
        AddUser: async (_root: unknown, 
            args: {gender: string; firstname: string; lastname: string; username: string; password: string }) => {

            const user = new User(
                {firstname: args.firstname,
                    lastname: args.lastname, 
                    username: args.username, 
                    password: args.password, 
                    entries:[],
                    gender: args.gender
                })
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
            const decodedToken = jwt.verify(auth.substring(7), config.JWT_SECRET) as Token
            console.log(decodedToken)
            const currentUser = await User.findById(decodedToken.id)
            return {currentUser}
        }
        return null
    }
})


server.listen().then(({url}) => {
    console.log(`Server running at ${url}`)
})