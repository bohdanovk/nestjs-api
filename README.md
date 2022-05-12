<p align="center">
  <img src="./docs/ultra.io-logo.svg" alt="Ultra logo"/>
</p>

# Coding Test

## Description

Hi, here is my backend coding test. This component exposes a REST api providing CRUD operations to fetch one or several games, create, update and delete a game.

### Some notes about particular tasks which you asked to implement

1. Fetch only the publisher data for a given game (without any publishers dedicated API – i.e. only by using the game API)
   - `/api/games/{GAME_ID}/publisher`. Details about this endpoint you can find in documentation which I provided.

2. To trigger a process which will automatically remove the games having a release date older than 18
   months and apply a discount of 20% to all games having a release date between 12 and 18 months
   - At first, I wanted the user to be able to select time intervals and discount percentages, but as this was not in the requirements these values are hardcoded. Just make a `PATCH` request to `/api/apocalypse`. Details about this endpoint you can find in documentation which I provided.

## Installation

```bash
$ docker-compose build
```

## Running the app

Default port for API is `9000`. So 
```bash
# development
$ docker-compose up
```

## Documentation
I've used Swagger for documenting API. You can use for manual testing or checking the implementation.
```bash
$ npm run docs
```
If line above causes some errors, just run the app and open make GET request to `/api/docs`. For example by default during development it's available on `http://localhost:9000/api/docs`

## Test

I've written only some unit tests to show my understanding of unit testing, so I've not covered whole project. I hope you understand that it's just routine.
```bash
# unit tests
$ npm run test
```

## Support
If you have any questions, you can contact me `kostiantyn.bohdanov@gmail.com`