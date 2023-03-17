
const express = require("express")
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
app.use(bodyParser.json())

//Establish the database connection

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"db_project"
})

db.connect(function(error){
  if(error){
      console.log("Error Connecting to DB")
  }else {
      console.log("Successfully connected to DB")
  }
})

//Establish the port
app.listen(5000,function check(error){
  if(error) console.log("Error.....!!!!")
  else console.log("Started....!!!!")

})

//compination function

function combineArrays(arr1, arr2) {
  const result = [];
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      result.push({ color: arr1[i], size: arr2[j] });
    }
  }
  return result;
}

// Store Query

app.post('/api/user/store', (req,res)=>{
   
  const {color, size} = req.body

        let details = {
              name :req.body.name,
              phone_no : req.body.phone_no,
              email_id : req.body.email_id,
              amount : req.body.amount
        }
    
   let sql_1 = "INSERT INTO user SET ?"

   db.query(sql_1, details, (error, response)=>{

   if(error) {
    res.status(500).send({status:false, message:"user creation failed"}) }
    
   let order_id = response.insertId  
   const combinations = combineArrays(color, size)

   let sql_2 = `INSERT INTO combinations (order_id, color, size) VALUES ? `;
    // second db
  db.query(sql_2,[combinations.map(s => [order_id, s.color, s.size])],(error) => {
                 
   if(error){
       console.log(error)
       res.status(500).send({status:"false",message:"combination of color and size creation Failed"})
       }else {
        res.status(200).send({status:"true",message:"combination of color and size creation Success"})
      }
    })

  })
})


// Get Query 
app.get('/api/list',(req, res)=>{
  
  let sql = `SELECT combinations.id, combinations.color, combinations.size
  FROM user
  INNER JOIN combinations
  ON user.order_id = combinations.order_id 
  WHERE user.is_deleted = "0"
  AND combinations.is_deleted = "0"`  

  db.query(sql,(error, result)=>{
    if(error){
      console.log(error)
      res.status(500).send({status:"false",message:"failed to fetch the data"})
      }else {
       res.status(200).send(result);
     }
  })
})


// Update Query

app.put('/api/update/:order_id/:id', (req, res) => {

  const order_id = req.params.order_id;
  const id = req.params.id
  const color = req.body.color;
  const size = req.body.size;

  // execute the SQL query to update the color and size columns
  const sql = `UPDATE combinations SET color = ?, size = ? WHERE order_id = ? AND id = ?`;
  db.query(sql, [color, size, order_id, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating color and size');
    } else {
      console.log(`Updated ${result.affectedRows} row(s)`);
      res.status(200).send(`Updated ${result.affectedRows} row(s)`);
    }
  });
});

//Temparory deleted Query

app.put('/api/temp-delete/:order_id/:id', (req, res) => {

  const order_id = req.params.order_id;
  const id = req.params.id
  const is_deleted = req.body.is_deleted;
  
  const sql = `UPDATE combinations SET is_deleted = ? WHERE order_id = ? AND id = ?`;
  db.query(sql, [is_deleted, order_id, id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating color and size');
    } else {
      console.log(`temp-delete ${result.affectedRows} row(s)`);
      res.status(200).send(`temp-delete ${result.affectedRows} row(s)`);
    }
  });
});


// Permanent Deleted Query

app.delete('/api/delete/:order_id/:id', (req, res) => {

  const order_id = req.params.order_id;
  const id = req.params.id
  
  const sql = `DELETE FROM combinations WHERE id = ?`;
  db.query(sql, [id, order_id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error');
    } else {
      console.log(`permanent-delete ${result.affectedRows} row(s)`);
      res.status(200).send(`permanent-delete ${result.affectedRows} row(s)`);
    }
  })

})
