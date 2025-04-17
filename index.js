import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { ApolloServer } from '@apollo/server';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import cors from 'cors';
import bodyParser from 'body-parser';

// types
import { typeDefs } from './schema.js';

// db
import check from './_db.js';

import { PubSub } from 'graphql-subscriptions';
const pubsub = new PubSub();

// Event constants
const GAME_ADDED = 'GAME_ADDED';
const GAME_UPDATED = 'GAME_UPDATED';
const GAME_DELETED = 'GAME_DELETED';
const REVIEW_ADDED = 'REVIEW_ADDED';
const REVIEW_UPDATED = 'REVIEW_UPDATED';
const REVIEW_DELETED = 'REVIEW_DELETED';
const AUTHOR_ADDED = 'AUTHOR_ADDED';
const AUTHOR_UPDATED = 'AUTHOR_UPDATED';
const AUTHOR_DELETED = 'AUTHOR_DELETED';

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
    reviews: (parent) =>
      check.reviews.filter((review) => review.game_id === parent.id),
  },
  Review: {
    game: (parent) => check.games.find((game) => game.id === parent.game_id),
    author: (parent) =>
      check.authors.find((author) => author.id === parent.author_id),
  },
  Author: {
    reviews: (parent) =>
      check.reviews.filter((review) => review.author_id === parent.id),
  },
  Mutation: {
    addGame: (_, args) => {
      const newGame = {
        id: Math.floor(Math.random() * 1000).toString(),
        ...args.game,
      };
      check.games.push(newGame);

      // publish the event
      pubsub.publish(GAME_ADDED, { gameAdded: newGame });

      return newGame;
    },
    deleteGame: (_, args) => {
      const deletedGame = check.games.find((game) => game.id === args.id);
      check.games = check.games.filter((game) => game.id !== args.id);

      // publish the event
      pubsub.publish(GAME_DELETED, { gameDeleted: deletedGame });

      return deletedGame;
    },
    updateGame: (_, args) => {
      check.games = check.games.map((game) => {
        if (game.id === args.id) {
          game = {
            ...game,
            ...args.game,
          };
        }
        return game;
      });

      const updatedGame = check.games.find((game) => game.id === args.id);
      // publish the event
      pubsub.publish(GAME_UPDATED, { gameUpdated: updatedGame });

      return check.games.find((game) => game.id === args.id);
    },
    addReview: (_, args) => {
      const newReview = {
        id: Math.floor(Math.random() * 1000).toString(),
        ...args.review,
      };
      check.reviews.push(newReview);
      return newReview;
    },
    deleteReview: (_, args) => {
      const deletedReview = check.reviews.find(
        (review) => review.id === args.id
      );
      check.reviews = check.reviews.filter((review) => review.id !== args.id);

      return deletedReview;
    },
    updateReview: (_, args) => {
      check.reviews = check.reviews.map((review) => {
        if (review.id === args.id) {
          review = {
            ...review,
            ...args.review,
          };
        }
        return review;
      });
      return check.reviews.find((review) => review.id === args.id);
    },
    addAuthor: (_, args) => {
      const newAuthor = {
        id: Math.floor(Math.random() * 1000).toString(),
        ...args.author,
      };
      check.authors.push(newAuthor);
      return newAuthor;
    },
    deleteAuthor: (_, args) => {
      const deletedAuthor = check.authors.find(
        (author) => author.id === args.id
      );
      check.authors = check.authors.filter((author) => author.id !== args.id);

      return deletedAuthor;
    },
    updateAuthor: (_, args) => {
      check.authors = check.authors.map((author) => {
        if (author.id === args.id) {
          author = {
            ...author,
            ...args.author,
          };
        }
        return author;
      });
      return check.authors.find((author) => author.id === args.id);
    },
  },

  // Add Subscription resolvers
  Subscription: {
    gameAdded: {
      subscribe: () => pubsub.asyncIterableIterator([GAME_ADDED]),
    },
    gameUpdated: {
      subscribe: () => pubsub.asyncIterableIterator([GAME_UPDATED]),
    },
    gameDeleted: {
      subscribe: () => pubsub.asyncIterableIterator([GAME_DELETED]),
    },
  },
};

// Create executable schema
const schema = makeExecutableSchema({ typeDefs, resolvers });

// server setup
const app = express();
app.use(cors(), bodyParser.json());

// Create HTTP server
const httpServer = createServer(app);

// Create WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/ws',
});

// Set up WebSocket server handlers
const serverCleanup = useServer({ schema }, wsServer);

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

// Apply middleware
app.use('/', expressMiddleware(server));

// Start the HTTP server
httpServer.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/`);
  console.log(`🚀 Subscriptions ready at ws://localhost:4000/ws`);
});
