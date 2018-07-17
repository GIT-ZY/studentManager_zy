let express = require('express');
let path = require("path")
//创建app
let app = express();
//导入session模块
let session = require('express-session');
//svg-captcha 验证码
var svgCaptcha = require('svg-captcha');
//导入body-parser 数据
let bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

//数据库
const dbName = 'myproject';
//设置托管静态资源
app.use(express.static("static"));
//使用session中间件
app.use(session({
    secret: 'keyboard cat',
  }))

//使post里的数据 可以看到
// 使用 bodyParser 中间件
app.use(bodyParser.urlencoded({
    extended: false
}))

//路由---------------------------------------------------
//路由1
//使用get方法 访问登录页面时 直接读取登录页面 并返回
app.get('/login',(req,res)=>{
    // console.log(req);
    
    res.sendfile(path.join(__dirname,'/static/views/login.html'))

})
//路由2
//使用post 接收form表单的内容
app.post('/login',(req,res)=>{
    // console.log(req.body);
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    let code = req.body.code;
    //和session中的验证码进行比较
    if(code==req.session.captcha) {
        console.log("验证正确");
        //设置session
        req.session.userInfo={
            userName,
            userPass
        }
        //去首页
        res.redirect('/index');
        
    }else {
        //console.log("验证失败");
        res.redirect('/login');
        res.setHeader('content-type', 'text/html');
        res.send('<script>alert("验证码失败");window.location.href="/login"</script>');
        
    }
    
    
})


//路由3
//生成图片的功能
app.get('/login/captchaImg',(req, res)=>{
    //生成一张图片并返回
    var captcha = svgCaptcha.create();
    //打印验证码
    // console.log(captcha.text);
    req.session.info=captcha.text;
    //获取session的值
    // console.log(req.session.info);
    //为了比较简单 直接转为小写
    req.session.captcha = captcha.text.toLocaleLowerCase();
    res.type('svg');
    res.status(200).send(captcha.data);
});      

// 路由4
// 访问首页 index
app.get('/index', (req, res) => {
   //如果有session就跳到首页
   if(req.session.userInfo){
    // res.redirect('/index');
    res.sendFile(path.join(__dirname,'static/views/index.html'))
   }else {
        // 没有session 去登录页
        res.setHeader('content-type', 'text/html');
        res.send("<script>alert('请登录');window.location.href='/login'</script>");
   }
})

//路由5
//登出操作
//删除session
app.get('/loginout',(req,res)=>{
    delete req.session.userInfo;
    //跳转到login页
    res.redirect('/login');

})


//路由6
//展示注册页面
app.get('/register',(req,res)=>{
   //直接读取并返回注册页 
   res.sendFile(path.join(__dirname, 'static/views/register.html'));
})

// 路由7
app.post('/register', (req, res) => {

    // 获取用户数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    console.log(userName);
    console.log(userPass);

    MongoClient.connect(url,  (err, client)=>{
        // 连上mongo之后 选择使用的库
        const db = client.db(dbName);
        // 选择使用的集合
        let collection = db.collection('userList');

        // 查询数据
        collection.find({
            userName
        }).toArray((err,doc)=>{
            console.log(doc);
            if(doc.length==0){
                // 没有人
                // 新增数据
                collection.insertOne({
                    userName,
                    userPass
                },(err,result)=>{
                    console.log(err);
                    // 注册成功了
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('欢迎入坑');window.location='/login'</script>")
                    // 关闭数据库连接即可
                    client.close();
                })
            }
        })
        
    });
})

// dwefkidjgbew[0iefrgdbv]


app.listen(8848,'127.0.0.1',()=>{
  console.log("监听成功");
  
})