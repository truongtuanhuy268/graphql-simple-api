export const typeDefs = `#graphql
    type Game {
        id: ID!
        title: String!
        platform: [String!]!
        reviews: [Review!]
    }
    type Review {
        id: ID!
        rating: Int!
        content: String!
        game: Game!
        author: Author!
    }
    type Author {
        id: ID!
        name: String!
        verified: Boolean!
        reviews: [Review!]
    }
    type Query {
        games: [Game]
        game(id: ID!): Game
        reviews: [Review]
        review(id: ID!): Review
        authors: [Author]
        author(id: ID!): Author
    }
    type Mutation {
        addGame(game: AddGameInput!): Game
        deleteGame(id: ID!): Game
        updateGame(id: ID!, game: UpdateGameInput!): Game
        
        addReview(review: AddReviewInput!): Review
        deleteReview(id: ID!): Review
        updateReview(id: ID!, review: UpdateReviewInput!): Review

        addAuthor(author: AddAuthorInput!): Author
        deleteAuthor(id: ID!): Author
        updateAuthor(id: ID!, author: UpdateAuthorInput!): Author
    }
    input AddGameInput {
        title: String!
        platform: [String!]!
    }
    input UpdateGameInput {
        title: String
        platform: [String!]
    }
    input AddReviewInput {
        rating: Int!
        content: String!
        game_id: ID!
        author_id: ID!
    }
    input UpdateReviewInput {
        rating: Int
        content: String
    }
    input AddAuthorInput {
        name: String!
        verified: Boolean!
    }
    input UpdateAuthorInput {
        name: String
        verified: Boolean
    }
`