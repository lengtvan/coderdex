const { restart } = require('nodemon')
var express = require('express');
const router = express.Router()
const crypto = require('crypto');
const { type } = require('os');

router.get("/", (req, res, next) => {
    const allowedFilter = [
        "Name",
        "Type",

    ];
    try {
        let { page, limit, ...filterQuery } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        //allow title,limit and page query string only
        const filterKeys = Object.keys(filterQuery);
        filterKeys.forEach((key) => {
            if (!allowedFilter.includes(key)) {
                const exception = new Error(`Query ${key} is not allowed`);
                exception.statusCode = 401;
                throw exception;
            }
            if (!filterQuery[key]) delete filterQuery[key];
        });
        let offset = limit * (page - 1);

        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        const pokemons = JSON.parse(db);

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
        res.status(200).send(result)
    } catch (error) {
        next(error);
    }
})

router.get("/:id", (req, res, next) => {
    try {


        const { id } = req.params


        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        const pokemons = JSON.parse(db);
        //find book by id
        const targetIndex = pokemons.findIndex(poke => poke.id === id)
        if (targetIndex < 0) {
            const exception = new Error(`Pokemon not found`);
            exception.statusCode = 404;
            throw exception;
        }
        //Update new content to db book JS object
        const requestedPokemon = db.pokemon[id]
        const prevPokemon = db.pokemons[id - 1]
        const nextPokemon = db.pokemons[id + 1]
        if (targetIndex = 721) {


            nextPokemon = db.pokemons[1]

        }
        if (targetIndex = 1) {

            prevPokemon = db.pokemons[721]

        }


        //put send response
        res.status(200).send(requestedPokemon, prevPokemon, nextPokemon)
    } catch (error) {
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
        const { name, id, imageUrl, type } = req.body;

        if (!name || !type || !imageUrl || !id) {
            const exception = new Error(`Missing required data`);
            exception.statusCode = 401;
            throw exception;
        }
        if (type.length > 2) {
            const exception = new Error(`Pokémon can only have one or two types.`);
            exception.statusCode = 401;
            throw exception;
        }
        if (type.filter((e) => !pokemonTypes.includes(e)).length > 0) {
            const exception = new Error(`if the types of Pokémon are not included in the valid given PokémonTypes array`);
            exception.statusCode = 401;
            throw exception;
        }

        const newPokemon = {
            name, type, imageUrl, id: crypto.randomBytes(4).toString("hex")
        };
        //Read data from db.json then parse to JSobject
        let db = fs.readFileSync("db.json", "utf-8");
        const pokemons = JSON.parse(db);

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
        next(error)
    }

})



module.exports = router;