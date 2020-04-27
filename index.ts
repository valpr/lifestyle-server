import { ApolloServer } from 'apollo-server'
import gql from 'graphql-tag'
import mongoose from 'mongoose'
import config from './utils/config'

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

  //TODO remove data from here
const users = [
    {
        username: "mlewis",
        name: "Mike Lewis",
        entries: [
            {
                id: 1,
                foodDescription:"Hash Browns",
                date: "2020-04-26",
                time: "2:00 PM",
                calories: 500,
            },
            {
                id: 2,
                foodDescription:"Roast Beef",
                date: "2020-04-26",
                time: "6:00 PM",
                calories: 1000,
            }
        ]
    },
    {
        username: "klou",
        name: "Karen Lou",
        entries: [
            {
                id: 1,
                foodDescription:"Ice Cream",
                date: "2020-04-26",
                time: "1:00 PM",
                calories: 200,
            },
            {
                id: 2,
                foodDescription:"Turkey Sandwich",
                date: "2020-04-26",
                time: "5:00 PM",
                calories: 500,
            }
        ]
    }
]

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
`

const resolvers = {
    Query: {
        allUsers: () => users,
        userCount: () => users.length,
    }
}

const server = new ApolloServer({
    typeDefs, 
    resolvers
})


server.listen().then(({url}) => {
    console.log(`Server running at ${url}`)
})