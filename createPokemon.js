const fs = require("fs")
const csv = require("csvtojson");

const createPokemon = async () => {
    let newData = await csv().fromFile("pokemon.csv")
    console.log(newData)

    newData = newData.slice(0, 721).map((e, index) => {
        const type = e.Type2 ? [e.Type1.toLowerCase(), e.Type2.toLowerCase()] : [e.Type1.toLowerCase()]

        return {
            id: index + 1, name: e.Name, type, imageUrl: `http://localhost:8000/images/${index + 1}.jpg`,
        }
    });

    fs.writeFileSync("db.json", JSON.stringify(newData))
}

createPokemon()
