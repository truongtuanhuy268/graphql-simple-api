import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// types
import { typeDefs } from "./schema.js";

// db
import check from "./_db.js";

// resolvers
const resolvers = {
    Query: {
        games: () => check.games,
        game: (_, args) => check.games.find((game) => game.id === args.id),
        reviews: () => check.reviews,
        review: (_, args) => check.reviews.find((review) => review.id === args.id),
        authors: () => check.authors,
        author: (_, args) => check.authors.find((author) => author.id === args.id),
    },
    Game: {
        reviews: (parent) => check.reviews.filter(review => review.game_id === parent.id)
    },
    Review: {
        game: (parent) => check.games.find(game => game.id === parent.game_id),
        author: (parent) => check.authors.find(author => author.id === parent.author_id)
    },
    Author: {
        reviews: (parent) => check.reviews.filter(review => review.author_id === parent.id)
    },
    Mutation: {
        addGame: (_, args) => {
            const newGame = {
                id: Math.floor(Math.random() * 1000).toString(),
                ...args.game
            }
            check.games.push(newGame)
            return newGame
        },
        deleteGame: (_, args) => {
            const deletedGame = check.games.find(game => game.id === args.id)
            check.games = check.games.filter(game => game.id !== args.id)

            return deletedGame
        },
        updateGame: (_, args) => {
            check.games = check.games.map(game => {
                if(game.id === args.id) {
                    game = {
                        ...game,
                        ...args.game
                    }
                }
                return game
            })
            return check.games.find(game => game.id === args.id)
        },
        addReview: (_, args) => {
            const newReview = {
                id: Math.floor(Math.random() * 1000).toString(),
                ...args.review
            }
            check.reviews.push(newReview)
            return newReview
        },
        deleteReview: (_, args) => {
            const deletedReview = check.reviews.find(review => review.id === args.id)
            check.reviews = check.reviews.filter(review => review.id !== args.id)

            return deletedReview
        },
        updateReview: (_, args) => {
            check.reviews = check.reviews.map(review => {
                if(review.id === args.id) {
                    review = {
                        ...review,
                        ...args.review
                    }
                }
                return review
            })
            return check.reviews.find(review => review.id === args.id)
        },
        addAuthor: (_, args) => {
            const newAuthor = {
                id: Math.floor(Math.random() * 1000).toString(),
                ...args.author
            }
            check.authors.push(newAuthor)
            return newAuthor
        },
        deleteAuthor: (_, args) => {
            const deletedAuthor = check.authors.find(author => author.id === args.id)
            check.authors = check.authors.filter(author => author.id !== args.id)

            return deletedAuthor
        },
        updateAuthor: (_, args) => {
            check.authors = check.authors.map(author => {
                if(author.id === args.id) {
                    author = {
                        ...author,
                        ...args.author
                    }
                }
                return author
            })
            return check.authors.find(author => author.id === args.id)
        }
    }
}

// server setup
const server = new ApolloServer({
    typeDefs,
    resolvers
})

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`🚀 Server ready at port`, 4000);