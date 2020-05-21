import { ApolloServer, UserInputError, IResolvers, AuthenticationError } from 'apollo-server'
import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import config from './utils/config'
import User, { IUser } from './models/user'
import Entry from './models/entry'
import { Token } from './types'
import bcrypt from 'bcrypt'

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
    type Token {
        value: String!
    }
    type Entry {
        description: String!
        date: Float!
        time: String!
        calories: Int!
    }

    type WeightEntry{
        date: Float!
        weight: Float!
    }

    type User {
        firstname: String!
        lastname: String!
        username: String!
        entries: [Entry]!
        gender: String!
        height: Float!
        weights: [WeightEntry]!
        effort: Float!
        objective: Float!
    }





    type Query {
        allUsers: [User!]!
        myUser: User!
        userCount: Int!
        myEntries: [Entry]!
    }

    type Mutation {
        AddUser (
            firstname: String!
            lastname: String!
            username: String!
            password: String!
            objective: Int!
            height: Float!
            weight: Float!
            effort: Float!
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
        allUsers: async () =>  {
            return await User.find({})
        },
        userCount: () => User.collection.countDocuments(),
        myUser: () => async (_root: unknown, 
            _args: unknown, 
            {currentUser}: {currentUser: IUser}) => {
            if (!currentUser){
                throw new AuthenticationError(
                    'Please login to add entries'
                )
            }
            else{
                return await User.find({'id': currentUser.id})
            }
        },
        myEntries: async (_root, _args, {currentUser}: {currentUser: IUser}) => {
            if (!currentUser){
                throw new AuthenticationError(
                    'Please login to view your entries'
                )
            }
            else{
                const testUser = await User.findMyEntries( currentUser.id)
                return testUser.entries
            }
        } 
    },
    Mutation: {
        Login: async (_root, args: {
            username: string; password: string;
        }) => {
            const foundUser = await User.findOne({username: args.username})
            if (foundUser){
                const passwordCorrect = await bcrypt.compare(args.password, foundUser.password)
                if (passwordCorrect){
                    const tokenPreSign = {
                        username: foundUser.username,
                        id: foundUser.id,
                    }
                    const token = jwt.sign(tokenPreSign, config.JWT_SECRET)
                    return {value: token}
                }
            }
            throw new AuthenticationError(
                'Incorrect username or password'
            )
        },
        AddUser: async (_root: unknown, 
            args: {gender: string; firstname: string; lastname: string; username: string; password: string; effort: number; height: number; weight: number; objective: number  }) => {
            
            const today = new Date()
            try {
                const user = new User(
                    {firstname: args.firstname,
                        lastname: args.lastname, 
                        username: args.username, 
                        password: args.password, 
                        entries:[],
                        gender: args.gender,
                        objective: args.objective,
                        effort: args.effort,
                        height: args.height,
                        weights: [
                            {
                                date: today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(),
                                weight: args.weight
                            }
                        ]
                    })
                const response = await user.save()
                return response
            }
            catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }
        },
        AddEntry: async (_root: unknown, 
            args: {description: string; date: string; time: number; calories: number}, 
            {currentUser}: {currentUser: IUser}) => {
            if (!currentUser){
                throw new AuthenticationError(
                    'Please login to add entries'
                )
            }
            
            try {
                const userToChange = await User.findOne({_id: currentUser.id})
                if (userToChange){
                const entry = new Entry(
                    {description: args.description, 
                        date: args.date, 
                        time: args.time, 
                        calories: args.calories,
                        user: userToChange._id
                    })
                
                const response = await entry.save()
                userToChange.entries.push(response.id)
                await userToChange.save()
                return response
                }
                else{
                    throw new Error('User not found')
                }
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
            const currentUser = await User.findById(decodedToken.id)
            return {currentUser}
        }
        return null
    }
})


server.listen().then(({url}) => {
    console.log(`Server running at ${url}`)
})