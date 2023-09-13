const express = require('express');
const router = express.Router();
const process = require('../config-server-env.js')
const environment = process.env.NODE_ENV

// ####### Knex Configs
const knex_config = require('../knexfile')
const database = require('knex')(knex_config[environment])


/** UX experimenting */
router.get('/ux1', function(req, res, next) {
  res.render('uxPagesExperiments/ux_JustNewsFeed');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.render('authPages/auth', { flashMessages: ''});
});

async function selectAllEmployees() {
  const results = await database('employees').select('*')
  return results
}

router.get("/api/v1/employees", async (req, res) => {
  try {
    console.log('running query...')
    const dataObject = await selectAllEmployees();
    console.log('dataObject', dataObject)
    res.status(200).json(dataObject)
  } catch (err) {
    console.log('err', err)
    res.status(500).json({message: "Error getting data"})
  }
});

module.exports = router;

