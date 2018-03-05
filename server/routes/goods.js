var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

// 链接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall');

mongoose.connection.on("connected",function(){
	console.log("MongoDB connected success");
});

mongoose.connection.on("error",function(){
	console.log("MongoDB connected error");
});

mongoose.connection.on("disconnected",function(){
	console.log("MongoDB connected disconnected");
});

//商品列表
router.get("/list",function(req, res,next){
	//res.send('respond with a resource test');
	//获取路由链接携带参数值；
	let page = parseInt(req.param("page"));
	let pageSize = parseInt(req.param("pageSize"));
	let sort = req.param("sort");
	let priceLevel = req.param("priceLevel");
	let params ={};
	var priceGt = '',priceLte = '';
	if(priceLevel!=='all'){
		switch(priceLevel){
			case '0':priceGt = 0;priceLte=500;break;
			case '1':priceGt = 500;priceLte=1000;break;
			case '2':priceGt = 1000;priceLte=2000;break;
			case '3':priceGt = 2000;priceLte=5000;break;
		};
		params = {
			salePrice:{
				$gt:priceGt,
				$lte:priceLte
			}
		}
	}
	let skip = (page-1)*pageSize;
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':sort});
	goodsModel.exec(function(err,doc){
    // Goods.find({},function(err,doc){
          if (err) {
          	res.json({
          		status:'1',
          		msg:err.message
          	});
          } else{
          	res.json({
          		status:'0',
          		msg:'',
          		result:{
          			count:doc.length,
          			list:doc
          		}
          	})
          };
    })
});


//加入购物车
router.post("/addCart",function(req,res,next){
   //res.send('respond with a resource test');
   var userId = '100000077',
       productId = req.body.productId;//接收post传递的参数
       //productId = '201710009';
   var User = require('../models/users');
   User.findOne({userId:userId},function(err,userDoc){
   	if(err){
   		res.json({
   			status:"1",
   			msg:err.message
   		})
   	}else{
   		console.log("userDoc:"+userDoc);
   		if(userDoc){
   			let goodsItem = '',Num='';
   			userDoc.cartList.forEach(function(item){
   				if(item.productId == productId){
   					item.productNum++;
   					Num=item.productNum;
   					goodsItem = item;
   				}
   			});
   			if(goodsItem){
   				userDoc.save(function(err2,doc2){
             		if(err2){
             			res.json({
             				status:"1",
             				msg:err2.message
             			})
             		}else{
             			res.json({
             				status:"0",
             				msg:"",
             				result:"suc",
             				data:goodsItem,
             				Num:Num
             			})
             		}
             	})
   			}else{
   				Goods.findOne({productId:productId},function(err1,doc){
	                 if(err1){
	                 	res.json({
				   			status:"1",
				   			msg:err1.message
				   		})
	                 }else{
	                 	if(doc){
	                 		doc.productNum = 1;
		                 	doc.checked = 1;
		                 	userDoc.cartList.push(doc);
		                 	userDoc.save(function(err2,doc2){
		                 		if(err2){
		                 			res.json({
		                 				status:"1",
		                 				msg:err2.message
		                 			})
		                 		}else{
		                 			res.json({
		                 				status:"0",
		                 				msg:"",
		                 				result:"suc",
		                 				data:doc,
		                 				Num:doc.productNum
		                 			})
		                 		}

		                 	})
	                 	}
	                 	
	                 }
	   			})
   			}
   			
   		}
   	}
   })
});

module.exports = router;