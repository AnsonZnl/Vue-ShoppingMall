var express = require('express');
var router = express.Router();
require('./../util/util');

var User = require('./../models/users')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
/* GET users listing. */
router.get('/test', function(req, res, next) {
  res.send('respond with a resource test');
});

//login
router.post('/login',function(req,res,next){
	//res.send('respond with a resource test');
	var params = {
		userName:req.body.userName,
		userPwd:req.body.userPwd
	}
	User.findOne(params,function(err,doc){
		if(err){
			res.json({
				status:"1",
				msg:err.message
			});
		}else{
			if(doc){
				res.cookie("userId",doc.userId,{
					path:'/',
					maxAge:1000*60*60
				});
				res.cookie("userName",doc.userName,{
					path:'/',
					maxAge:1000*60*60
				});
				res.json({
					status:"0",
					msg:"",
					result:{
						userName:doc.userName
					}
				});
			}
		}
	})

});

//登出接口
router.post("/logout",function(req,res,next){
	res.cookie("userId","",{
		path:"/",
		maxAge:-1
	});
	res.json({
		status:"0",
		msg:'',
		result:''
	})
});

//核对登录
router.get("/checkLogin", (req,res,next)=>{
	if(req.cookies.userId){
		res.json({
			status:'0',
			msg:'',
			result:req.cookies.userName || ''
		});
	}else{
		res.json({
			status:'1',
			msg:'未登录',
			result:''
		});
	}
});

//查询当前用户的购物车数据
router.get("/cartList",(req,res,next)=>{
	var userId=req.cookies.userId;
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			if(doc){
				res.json({
					status:'0',
					msg:'',
					result:doc.cartList
				})
			}
		}
	})
})

//购物车删除
router.post('/cartDel',function(req,res,next){
	var userId=req.cookies.userId,productId=req.body.productId;
	User.update({
		userId:userId
	},{
		$pull:{
			"cartList":{
				"productId":productId
			}
		}
	},function(err,doc){
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'suc'
			})
		}
	})
});

//编辑购物车数量
router.post("/cartEdit",(req,res,next)=>{
	var userId=req.cookies.userId,
	    productId=req.body.productId,
	    productNum=req.body.productNum,
	    checked=req.body.checked;
	User.update({"userId":userId,"cartList.productId":productId},{
		"cartList.$.productNum":productNum,
		"cartList.$.checked":checked,
	},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'suc',
				productNum:productNum
			})
		}
	})
});

//checkAll
router.post("/editCheckAll",(req,res,next)=>{
	var userId = req.cookies.userId,
	    checkAll = req.body.checkAll?1:0;
	User.findOne({userId:userId},(err,user)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			if(user){
				user.cartList.forEach((item)=>{
					item.checked=checkAll;
				});
				user.save((err1,doc)=>{
					if(err1){
						res.json({
							status:'1',
							msg:err1.message,
							result:''
						})
					}else{
						res.json({
							status:'0',
							msg:'',
							result:'suc'
						})
					}
				})
			}
			
		}
	})
});
//查询用户地址
router.get("/addressList",(req,res,next)=>{
	var userId=req.cookies.userId;
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			if(doc){
				res.json({
					status:'0',
					msg:'',
					result:doc.addressList
				})
			}
		}
	})
});

//设置默认地址
router.post("/setDefault",(req,res,next)=>{
	var userId=req.cookies.userId,
	    addressId=req.body.addressId;
    User.findOne({userId:userId},(err,doc)=>{
    	if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			if(doc){
				var addressList = doc.addressList;
				addressList.forEach((item)=>{
					if(item.addressId==addressId){
						item.isDefault=true;
					}else{
						item.isDefault=false;
					}
				});
				doc.save((err1,doc1)=>{
					if(err1){
						res.json({
							status:'1',
							msg:err.message,
							result:''
						})
					}else{
						res.json({
							status:'0',
							msg:'',
							result:'setDefault is suc'
						})
					}
				})
				
			}
		}
    })
});

//删除地址
router.post("/delAddress",(req,res,next)=>{
	var userId=req.cookies.userId,addressId=req.body.addressId;
	User.update({userId:userId},{$pull:{"addressList":{'addressId':addressId}}},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'setDefault is suc'
			})
		}
	})
});

//创建订单
router.post("/payMent",(req,res,next)=>{
	var userId=req.cookies.userId,
	    orderTotal=req.body.orderTotal,
	    addressId=req.body.addressId;
	User.findOne({userId:userId},(err,doc)=>{
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			})
		}else{
			var address='',
			    goodList=[];
			//获取订单地址
			doc.addressList.forEach((item)=>{
				if(item.addressId==addressId){
					address=item;
				}
			});
			//获取订单商品列表
			doc.cartList.filter((item)=>{
				if(item.checked==1){
					goodList.push(item);
				}
			});

			var platform = '622';
			var r1 = Math.floor(Math.random()*10);
			var r2 = Math.floor(Math.random()*10);
			var sysDate = new Date().Format('yyyyMMddhhmmss');
			var creatDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
			var orderId = platform+r1+sysDate+r2

			var order = {
				orderId:orderId,
				orderTotal:orderTotal,
				addressInfo:address,
				goodList:goodList,
				orderStatus:'1',
				creatDate:creatDate
			};
			doc.orderList.push(order);
			doc.save((err1,doc1)=>{
				if(err1){
					res.json({
						status:'1',
						msg:err1.message,
						result:''
					})
				}else{
					res.json({
						status:'0',
						msg:'',
						result:{
							orderId:order.orderId,
							orderTotal:order.orderTotal
						}
					})
				}
			})
			
		}
	})
});

//订单详情
router.get("/orderDetail",(req,res,next) => {
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId},(err,userInfo) => {
    if(err){
    res.json({
      status:'1',
      msg:'err.message',
      result:''
    })
  }else{
    var orderList = userInfo.orderList
    if(orderList.length>0){
      var orderTotal = 0
      orderList.forEach((item) => {
        if(item.orderId === orderId){
          orderTotal = item.orderTotal
        }
      })
      if(orderTotal){
        res.json({
          status:'0',
          msg:"",
          result:{
            orderId:orderId,
            orderTotal:orderTotal
          }
        })
      }else{
        res.json({
          status:'12002',
          msg:'无此订单',
          result:''
        })
      }
    }else{
      res.json({
        status:'12001',
        msg:'当前用户没有订单',
        result:''
      })
      
    }
  }
  })
});

//购物车数量
router.get("/getCartCount",(req,res,next)=>{
	if(req.cookies && req.cookies.userId){
		var userId=req.cookies.userId;
		User.findOne({userId:userId},(err,doc)=>{
			if(err){
				res.json({
			      status:'1',
			      msg:'err.message',
			      result:''
			    })
			}else{
				var cartList=doc.cartList;
				var cartCount=0;
				cartList.map((item)=>{
					cartCount+=parseInt(item.productNum);
				})
				res.json({
					status:'0',
					msg:'',
					result:cartCount
				})
			}
		})
	}
})


module.exports = router;
