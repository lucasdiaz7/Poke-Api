const { Router } = require('express');
const axios = require("axios")
const {Pokemon, Types} = require('../db');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {
    const getApi = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=40')
    const apiInfo = await Promise.all(getApi.data.results.map(async poke => {
        let pokeDetail = await axios.get(poke.url)
        return{
            id: pokeDetail.data.id,
            name: pokeDetail.data.name,
            image: pokeDetail.data.sprites.other.home.front_default,
            types: pokeDetail.data.types.map(t => t.type.name + " "),
            hp: pokeDetail.data.stats[0].base_stat,
            attack: pokeDetail.data.stats[1].base_stat,
            defense: pokeDetail.data.stats[2].base_stat,
            speed: pokeDetail.data.stats[5].base_stat,
            weight: pokeDetail.data.weight,
            height: pokeDetail.data.height
        }
    }))
    return apiInfo
}

//  const getApiInfo = async () => {
//     try {
//         const poke1 = await axios("https://pokeapi.co/api/v2/pokemon")
//         const poke2 = await axios(poke1.data.next)
//         const pokeData = poke1.data.results.concat(poke2.data.results)
//         // console.log("pokeData", pokeData)
//         const pokemon = await Promise.all(pokeData.map(async poke => {
//             let pDetail = await axios(poke.url)
//               return {  
//                 id: pDetail.data.id,
//                   name: pDetail.data.name,
//                   image: pDetail.data.sprites.other.home.front_default,
//                   types: pDetail.data.types.map(t => t.type.name),
//                   hp: pDetail.data.stats[0].base_stat,
//                   attack: pDetail.data.stats[1].base_stat,
//                   defense: pDetail.data.stats[2].base_stat,
//                   speed: pDetail.data.stats[5].base_stat,
//                   height: pDetail.data.height, 
//                   weight: pDetail.data.weight
//             }
//         }))
//         return pokemon;
//     } catch (error) {
//       console.log(error)
//         throw new Error(error)
//     }
// }


const getDb = async () => {
  const pokemon =  await Pokemon.findAll({
      include:{
          model: Types,
          attributes : ['name'],
          through :{
              attributes : [],
          }
      }})
      const pokeFilter = pokemon?.map( pok => {
        return {
        ...pok.dataValues,
        types: pok.types?.map(t => t.name)
      }})
      return pokeFilter;
    }

const apiDb = async () => {
    const api = await getApiInfo();
    const db = await getDb();
    const infoTotal = db.concat(api)
    return infoTotal

}



// router.get('/pokemons', async (req, res) => {
//     let { name } = req.query
//    try {
//       if(name){
//         name = name.toLowerCase()
//         let pokeBd = await Pokemon.findOne({ 
//           where: { name }, 
//           include: {
//             model: Types,
//             attributes: ['name'],
//             through: {
//               attributes: []
//             }
//           }
//       })
//         if(pokeBd){ 
//           return res.status(200).json(pokeBd)
//         }
//           let poke = await axios.get("https://pokeapi.co/api/v2/pokemon/"+name)
//         if(poke){
//           let pokemon = {  
//             id: poke.data.id,
//               name: poke.data.name,
//               img: poke.data.sprites.other.home.front_default,
//               types: poke.data.types.map(t => t.type.name),
//               hp: poke.data.stats[0].base_stat,
//               attack: poke.data.stats[1].base_stat,
//               defense: poke.data.stats[2].base_stat,
//               speed: poke.data.stats[5].base_stat,
//               height: poke.data.height, 
//               weight: poke.data.weight
//             }
//               return res.status(200).json(pokemon)
//         } else { 
//             return res.status(404).json({Error: error.message})}
//         } else {
//           let allPokemon = await apiDb() // si no pasaron name por query devuelve todos los pokemons
//           return res.status(200).json(allPokemon)
//         }
//       } catch (error) {
//     res.status(404).json({Error: error.message})
//   }
// })

router.get('/pokemons', async (req, res) => {
  const {name} = req.query
  const allPokemons = await apiDb();
  if(name){
    let pokeName = await allPokemons.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()))
    pokeName.length? res.status(200).send(pokeName) : res.status(404).send("No existe el pokemon con ese nombre")
  }else{
    res.status(200).send(allPokemons)
  }
})

router.get('/pokemons/:id', async(req,res)=>{
  const {id} = req.params
  const allPokemons = await apiDb()
  const pokeId = allPokemons.filter((p)=> p.id == id)
  if(id){
    pokeId.length? res.status(200).send(pokeId) : res.status(404).send("No existe el pokemon con ese id")
  }
})

// router.get("/pokemons/:id" , async (req, res) => {
//   const { id } = req.params 
//   // console.log("IDPOKEMON", id, Number(id), typeof id)
//     try {
//       if(Number(id)){
//         let pokemon = await axios("https://pokeapi.co/api/v2/pokemon/"+id)  
//         if(pokemon){
//           let pokeById = { 
//             id: pokemon.data.id,
//               name: pokemon.data.name,
//               image: pokemon.data.sprites.versions["generation-v"]["black-white"].animated.front_default,
//               types: pokemon.data.types.map(t => t.type.name),
//               hp: pokemon.data.stats[0].base_stat,
//               attack: pokemon.data.stats[1].base_stat,
//               defense: pokemon.data.stats[2].base_stat,
//               speed: pokemon.data.stats[5].base_stat,
//               height: pokemon.data.height, 
//               weight: pokemon.data.weight
//           }
//           return res.json(pokeById)   
//         }
//       } else{
//         const poke = await Pokemon.findByPk(id, { include: Types }) 
//         // console.log("POKEBACKEND", poke)
//         const pokemonDb = {
//           id: poke.id,
//           name: poke.name,
//           image: poke.image,
//           types: poke.types.map(t => t.name),
//           hp: poke.hp,
//           attack: poke.attack,
//           defense: poke.defense,
//           speed: poke.speed,
//           height: poke.height,
//           weight: poke.weight,
//           createdInDb: poke.createdInDb
//         };
//         // console.log("POKEBACKEND2", pokemonDb)
//         return res.json(pokemonDb) 
//       }
//     } catch (error) {
//       res.status(404).send("No se encontró el pokemón")
//     }
//   })

  
router.get('/types', async(req,res)=>{
 const typesApi = await axios.get("https://pokeapi.co/api/v2/type")
let types = typesApi.data.results.map((t)=> t.name+ " ")
// console.log("TYPES", types)

types.forEach(el =>{
  Types.findOrCreate({
    where : {name: el}
  })
})
eachTypes = await Types.findAll()
res.status(200).send(eachTypes)
})

router.post('/pokemons' , async (req, res) =>{
  const {name, weight, height, hp, attack, defense, image, createInDb, types} = req.body
  const pokeCreate = await Pokemon.create({name, weight, height, hp, attack, defense, image, createInDb})
  let type = await Types.findAll({
    where: {name : types}
  })
  pokeCreate.addTypes(type)
  res.json("Tu pokemon fue creado con exito")
})

router.delete("/delete/:id", async (req,res)=>{
  const {id} = req.params
  const poke = await Pokemon.findByPk(id)
  if(!poke){
    res.status(400).send("No existe el pokemon")
  }else{
    await poke.destroy()
    res.send("Se elimino el pokemon")
  }
})

router.put("/pokemons/:id" , async (req, res) =>{
  const {name, weight, height, hp, attack, defense, speed, image } = req.body
  const {id} = req.params
  const pokeput = await Pokemon.findByPk(id)
  if(!pokeput){
    res.status(400).send("no se encontro el pokemon con ese id")
  }else{
    await pokeput.update({
      name: name, 
      hp: hp, 
      attack: attack, 
      defense: defense, 
      speed : speed, 
      height: height, 
      weight: weight, 
      image: image
    }, {
      where: {id: id}
    })
    res.status(200).send(pokeput)
  }
})



module.exports = router;
