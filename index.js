const express=  require('express');
const exphbs=  require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride= require('method-override');
const redis = require('redis');

//create redis
let client = redis.createClient();

client.on('connect',function(){
	console.log('connected redis. . . ')
});

//set port
const port =3300

const app=express()

app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(methodOverride('_method'));

//search page
app.get('/', function(req,res,next) {
	
	client.keys("*" ,function(err,obj){
		if(!obj){
			res.render('searchusers',{
				error:'Data not exsist'
			});
		}
		else{
			res.render('searchusers',{
				data:obj
			});
		}
	});
})

//search process 
app.post('/user/search', function(req,res,next){
	let id = req.body.id;

	client.hgetall(id, function(err, obj){
		if(!obj){
			res.render('searchusers',{
				error:'User does not exsist'
			});
		}
		else{
			obj.id=id;
			res.render('details',{
				user: obj
			})
		}
	});

})

//add user page
app.get('/user/add', function(req,res,next) {
	res.render('addusers');
})
//add user process
app.post('/user/add', function(req,res,next) {
	let id = req.body.id;
	let first_name = req.body.first_name;
	let last_name = req.body.last_name;
	let email = req.body.email;
	let phone = req.body.phone;
	
	client.hmset(id, [
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function(err, reply){
  	if(err){
      console.log(err);
    }
    console.log(reply);
    res.redirect('/');
  })
})
//delete process
app.delete('/user/delete/:id', function(req,res,next){
	client.del(req.params.id);
	res.redirect('/');
})

app.listen(port,function(){
	console.log(`server is running on port`+port)
})