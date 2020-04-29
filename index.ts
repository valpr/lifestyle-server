import { ApolloServer, UserInputError, IResolvers } from 'apollo-server'
import gql from 'graphql-tag'
import mongoose from 'mongoose'
import config from './utils/config'
import User from './models/user'
import Entry from './models/entry'

mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)


mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
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
        ): User
        AddEntry (
            description: String!
            date: String!
            time: Int!
            calories: Int!
        ): Entry
    }
`

const resolvers: IResolvers = {
    Query: {
        allUsers: () => User.find({}),
        userCount: () => User.collection.countDocuments(),
    },
    Mutation: {
        AddUser: async (_root: unknown, args: { name: string; username: string }) => {
            const user = new User({name: args.name, username: args.username, entries:[]})
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
    resolvers
})


server.listen().then(({url}) => {
    console.log(`Server running at ${url}`)
})