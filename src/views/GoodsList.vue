<template>
<div>
<nav-header></nav-header>
<nav-bread>
	<slot>index</slot>
</nav-bread>

<div class="accessory-result-page accessory-page">
  <div class="container">
    <div class="filter-nav">
      <span class="sortby">Sort by:</span>
      <a href="javascript:void(0)" class="default cur">Default</a>
      <a href="javascript:void(0)" class="price" @click="sortGoods">Price 
          <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':!sortFlag}">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use>
          </svg>
      </a>
      <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
    </div>
    <div class="accessory-result">
      <!-- filter -->
      <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterby}">
        <dl class="filter-price">
          <dt>Price:</dt>
          <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceChecked=='all'}" @click="priceChecked='all'">All</a></dd>
          <dd v-for="(item,index) in priceFilter">
            <a href="javascript:void(0)" v-bind:class="{'cur':priceChecked==index}" @click="priceFilterChecked(index)">{{item.priceStart}} - {{item.priceEnd}}</a>
          </dd>
        </dl>
      </div>

      <!-- search result accessories list -->
      <div class="accessory-list-wrap">
        <div class="accessory-list col-4">
          <ul>
            <li v-for="item in goodsList">
              <div class="pic">
                <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
              </div>
              <div class="main">
                <div class="name">{{item.productName}}</div>
                <div class="price">{{item.salePrice}}</div>
                <div class="btn-area">
                  <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId);">加入购物车</a>
                </div>
              </div>
            </li>
          </ul>
          <div class="loadmore" v-show="!busy" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30">
              <img src="/static/loading-svg/loading-spinning-bubbles.svg">
           </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="md-overlay" v-show="overLayFlag" @click="closeFilterPop"></div>
<nav-footer></nav-footer>

<modal v-bind:mdShow="mdShow" v-on:close="closeModal">
  <p slot="message">请先登录，否者无法加入购物车！</p>
  <div slot="btnGroup">
    <a class="btn btn--m" href="javascript:;" @click="mdShow=false">关闭</a>
  </div>
</modal>
<modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
  <p slot="message">加入购物车成功！</p>
  <div slot="btnGroup">
    <a class="btn btn--m" href="javascript:;" @click="mdShowCart=false">继续购物</a>
    <router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
  </div>
</modal>
</div>
</template>
<style type="text/css">
  .accessory-list ul::after{
    clear: both;
    content: '';
    height: 0;
    display: block;
    visibility: hidden;
  }
  .loadmore{height:100px; line-height: 100px;}
  .sort-up{
    transform:rotate(180deg);
    transition:all .3s ease-out;
  }
  .icon-arrow-short{transition:all .3s ease-out;}
  .btn:hover{background-color: #ffe5e6;transition:all .3s ease-out;}
  
</style>
<script type="text/javascript">
    import '../assets/css/base.css'
    import '../assets/css/login.css'
    import '../assets/css/product.css'
    import NavHeader from '@/components/NavHeader'
    import NavBread from '@/components/NavBread'
    import NavFooter from '@/components/NavFooter'
    import modal from '@/components/modal'
    import axios from 'axios'
	export default{
		data(){
			return {
        goodsList:[],
        priceChecked:'all',
        overLayFlag:false,
        mdShow:false,
        mdShowCart:false,
        filterby:false,
        sortFlag:1,
        sort:true,
        page:1,
        pageSize:8,
        busy:true,
        priceFilter:[{
          priceStart:0,
          priceEnd:500
        },{
          priceStart:500,
          priceEnd:1000
        },{
          priceStart:1000,
          priceEnd:2000
        }],
        item: [{
          "productId":"10010",
          "productName":"ipad",
          "productPrice":332,
          "productImg":"./static/1.jpg"
        },{
          "productId":"10011",
          "productName":"ipad1",
          "productPrice":3321,
          "productImg":"./static/2.jpg"
        },{
          "productId":"10012",
          "productName":"ipad2",
          "productPrice":3322,
          "productImg":"./static/3.jpg"
        },{
          "productId":"10013",
          "productName":"ipad3",
          "productPrice":3323,
          "productImg":"./static/4.jpg"
        }]
			}
		},
    components:{
      NavHeader,
      NavBread,
      NavFooter,
      modal
    },
    mounted:function(){
      this.getGoodsList();
    },
    methods:{
      getGoodsList(flag){
        var params={
          page:this.page,
          pageSize:this.pageSize,
          sort:this.sortFlag?1:-1,
          priceLevel:this.priceChecked
        }
        axios.get("/goods/list",{
          params:params
        }).then((result)=>{
          if(result.data.status==0){
            var res = result.data;
            //访问本地json数据
            // this.goodsList=res.goodsData.result;
            // console.log(res);
            // console.log(res.goodsData.result);
            console.log(res);
            console.log(res.result.list);
            if(flag){
              this.goodsList=this.goodsList.concat(res.result.list);  
              if(res.result.count<this.pageSize){
                this.busy = true;
              }else{
                this.busy = false;
              }            
            }else{
              this.goodsList=res.result.list;
              this.busy = false;                            
            }

          }else{
            this.goodsList = [];
          }
        });
      },
      sortGoods(){
        this.sortFlag = !this.sortFlag;
        this.page = 1;
        this.getGoodsList();

      },
      addCart(productId){
        axios.post("/goods/addCart",{
          productId:productId
        }).then((res)=>{
          if(res.data.status=="0"){
            //alert("加入成功");
            this.mdShowCart=true;
            this.$store.commit("updateCartCount",1);
          }else{
            //alert("msg:"+res.data.msg);
            this.mdShow=true;
          }
        })
      },
      loadMore(){
        this.busy = true;
   
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },
      priceFilterChecked(index){
        this.priceChecked=index;
        this.closeFilterPop();
        this.page=1;
        this.getGoodsList();
      },
      showFilterPop(){
        this.filterby = true,
        this.overLayFlag = true
      },
      closeFilterPop(){
        this.filterby = false,
        this.overLayFlag = false
      },
      closeModal(){
        this.mdShow = false;
        this.mdShowCart = false;
      }
    }
	}
</script>