var express = require('express');
var router = express.Router();

const process = require('../config-server-env.json')
const environment = process.env.NODE_ENV
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function selectAllEmployees() {
  const results = await database('employees').select('*')
  return results
}

router.get("/employees", async (req, res) => {
  try {
    console.log('running query...')
    const dataObject = await selectAllEmployees();
    console.log('dataObject', dataObject)
    res.status(200).json(dataObject)
  } catch (err) {
    // console.log('res', res)
    console.log('err', err)
    res.status(500).json({message: "Error getting posts"})
  }
});

module.exports = router;
