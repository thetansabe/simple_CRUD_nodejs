const axios = require('axios').default;
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/add', (req,res,next) => {
  res.render('add_user')
})

router.post('/add',
      body('email').isEmail(),
      (req,res,next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        console.log({...req.body, age: parseInt(req.body.age)})
        const result = async () => {
          try{
            const response = 
                await axios.post('https://web-nang-cao.herokuapp.com/lab5/users', 
                                {...req.body, age: parseInt(req.body.age)},
                                {
                                  headers: {'Content-Type' : 'application/json'}
                                })
            return response.data
          }catch(err){
            console.error(err)
          }
        }

        result()
          .then(response => {
            if(response.code == 0){
              //thong bao thanh cong
              req.session.flash = {
                type: 'success',
                intro: 'Add successfully',
                message: 'A person has been added'
              }
            }else{
              req.session.flash = {
                type: 'danger',
                intro: 'Add failed',
                message: response.message
              }
            }
            return res.redirect(303,'/users/add')
          })
          
      }
)

async function getUserById(id){
  try{
    const response = await axios.get(`https://web-nang-cao.herokuapp.com/lab5/users/${id}`)
    return response.data
  }catch(err){
    console.log(err)
  }
}

router.get('/update/:id', (req,res) => {
  // {
  //   code: 0,
  //   message: 'OK',
  //   data: {
  //     id: 'ohJKfGJgrT57J8bRxFk7SK',
  //     name: 'Nguyễn Xuân Vinh',
  //     age: 30,
  //     email: 'vinh@gmail.com',
  //     gender: 'male',
  //     created_at: 'Thu, 31 Mar 2022 09:14:44 GMT',
  //     update_at: 'Thu, 31 Mar 2022 09:14:44 GMT'
  //   }
  // }
  
  getUserById(req.params.id)
  .then(response => {
    if(response.code === 0){
      return res.render('update_user', response.data)
    }
  })
  .catch(err => console.log(err))
  //res.render('update_user')
})

async function updateUser(data){
  try{
    const response = await axios.put(
                  'https://web-nang-cao.herokuapp.com/lab5/users',
                  data,
                  {
                    'headers': {'Content-Type' : 'application/json'}
                  })

    return response.data
  }catch(err){
    console.log(err)
  }
}

router.put('/update', (req, res, next) => {
  console.log('user update input: ', req.body)
  //check case neu nguoi dung nhap khong du thong tin
  getUserById(req.body.id)
  .then(response => {
    if(response.code == 0){
      const name = req.body.name || response.data.name
      const age = parseInt(req.body.age || response.data.age)
      const email = req.body.email || response.data.email
      const gender = req.body.gender || response.data.gender

      const updateObject = {
        id : req.body.id,
        name,age,email,gender
      }

      console.log('real update input', updateObject)

      //request len rest api
      updateUser(updateObject)
      .then(response => {
        if(response.code === 0){
          req.session.flash = {
            type: 'success',
            intro: 'update user successfully',
            message: response.message
          }
        }else{
          req.session.flash = {
            type: 'danger',
            intro: 'update user failed',
            message: response.message
          }
        }

        return res.redirect(303, '/')
      })
    }
  })
  .catch(err => {
    console.log(err)
    return res.send('something went wrong at 154 users.js')
  })

})
module.exports = router;
