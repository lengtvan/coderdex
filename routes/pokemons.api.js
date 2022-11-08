const { restart } = require('nodemon')
var express = require('express');
const router = express.Router()
const crypto = require('crypto');
const { type } = require('os');
const fs = require("fs");
const { maxHeaderSize } = require('http');

router.get("/", (req, res, next) => {
    const allowedFilter = [
        'search',
        'type',
    ];

    try {
        let { page, limit, ...filterQuery } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        console.log(filterQuery)
        const filterKeys = Object.keys(filterQuery);

        filterKeys.forEach((key) => {
            console.log(key)
            if (!allowedFilter.includes
                (key)) {
                const exception = new Error(`Query ${key} is not allowed`);
                exception.statusCode = 401;
                throw exception;
            }
            if (!filterQuery[key]) delete filterQuery[key];
        });
        let offset = limit * (page - 1);

        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        let pokemons = JSON.parse(db);

        //Filter data by title
        let result = [];
        if (filterKeys.length) {
            filterKeys.forEach((condition) => {
                result = result.length
                    ? result.filter((poke) => poke[condition] === filterQuery[condition] || poke[condition].includes(filterQuery[condition]))
                    : pokemons.filter((poke) => poke[condition] === filterQuery[condition] || poke[condition].includes(filterQuery[condition]));
            });
        }

        else {
            result = pokemons;
        }
        //then select number of result by offset
        result = result.slice(offset, offset + limit);
        res.status(200).send({ data: result })
    }
    catch (error) {
        error.statusCode = 400;
        next(error);
    }
})

router.get("/:id", (req, res, next) => {
    try {
        let { id } = req.params;
        id = parseInt(id)
        let db = fs.readFileSync("db.json", "utf-8");
        let pokemons = JSON.parse(db);
        const targetIndex = pokemons.findIndex(poke => poke.id === id)
        if (targetIndex < 0) {
            const exception = new Error(`Pokemon not found`);
            exception.statusCode = 404;
            throw exception;
        }
        //Update new content to db book JS object
        const pokemon = pokemons[id - 1]
        let previousPokemon = pokemons[id - 2]
        let nextPokemon = pokemons[id]
        if (targetIndex === 720) {
            nextPokemon = pokemons[0]
        }
        if (targetIndex === 0) {
            previousPokemon = pokemons[720]
        }
        console.log(targetIndex)

        //put send response
        res.status(200).send({ data: { pokemon, previousPokemon, nextPokemon } })
    } catch (error) {
        error.statusCode = 400;
        next(error)
    }
})

router.post("/", (req, res, next) => {
    try {
        const pokemonTypes = [
            "bug", "dragon", "fairy", "fire", "ghost",
            "ground", "normal", "psychic", "steel", "dark",
            "electric", "fighting", "flyingText", "grass", "ice",
            "poison", "rock", "water"
        ]
        const { name, id, url, types } = req.body;

        if (!name || !types || !url || !id) {
            const exception = new Error(`Missing required data`);
            exception.statusCode = 401;
            throw exception;
        }
        if (types.length > 2) {
            const exception = new Error(`Pokémon can only have one or two types.`);
            exception.statusCode = 401;
            throw exception;
        }
        if (types.filter((e) => !pokemonTypes.includes(e)).length > 0) {
            const exception = new Error(`if the types of Pokémon are not included in the valid given PokémonTypes array`);
            exception.statusCode = 401;
            throw exception;
        }

        const newPokemon = {
            name, types, url, id
        };
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");

        let pokemons = JSON.parse(db);

        const pokeNames = pokemons.map((e) => e.name)
        const pokeIds = pokemons.map((e) => e.id)
        if ((pokeNames.includes(name)) || (pokeIds.includes(id))) {
            const exception = new Error(`The Pokémon already exists.`);
            exception.statusCode = 401;
            throw exception;
        }
        //Add new book to book JS object
        pokemons.push(newPokemon)
        //Add new book to db JS object
        db.pokemons = pokemons
        //db JSobject to JSON string
        db = JSON.stringify(db)
        //write and save to db.json
        fs.writeFileSync("db.json", db)

        res.status(200).send(newPokemon)
    } catch (error) {
        error.statusCode = 400;
        next(error)
    }

})

router.delete("/:id", (req, res, next) => {
    try {
        let { id } = req.params;
        id = parseInt(id)
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        let pokemons = JSON.parse(db);
        // console.log(type(pokemons))
        //find book by id
        const targetIndex = pokemons.findIndex(poke => poke.id === id)
        if (targetIndex < 0) {
            const exception = new Error(`Pokemon not found`);
            exception.statusCode = 404;
            throw exception;
        }


        //filter db books object
        pokemons = pokemons.filter(poke => poke.id !== id)
        //db JSobject to JSON string

        db = JSON.stringify(pokemons)
        //write and save to db.json

        fs.writeFileSync("db.json", db)
        //delete send response
        res.status(200).send({})
    } catch (error) {
        error.statusCode = 400;
        next(error)
    }

})

module.exports = router;