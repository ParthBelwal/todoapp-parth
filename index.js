const express=require('express');
const https=require('https');
const app=express()
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.set('view engine','ejs');
const bodyParser=require('body-parser');
const exp = require('constants');
const { name } = require('ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.get("/",async function(req,res){
  var comments=await prisma.comments.findMany();
  var users=await prisma.user.findMany();
  var team=await prisma.team.findMany();
  var post=await prisma.post.findMany();
  console.log(comments,users,team,post);
    res.render('login',{credentials:""});
});
var user,team;
async function delcomments(pid){
    var deletecomments=await prisma.comments.deleteMany({
        where: {
          postid: pid,
        },
      }) 
}
async function delcomauth(aid){
  var deletecomments=await prisma.comments.deleteMany({
      where: {
        authorId: aid,
      },
    }) 
}
async function delpostteam(teid){
    var p=await prisma.post.findMany({
        where: {
          teamid: teid,
        },
      })
      for(var i=0;i<p.length;i++)
      {
        var poid=p[i].id;
        delcomments(poid);
        const deleteposts = await prisma.post.delete({
            where: {
              id: poid,
            },
          });
      }
}
async function delpostauth(teid){
  var p=await prisma.post.findMany({
      where: {
        authorId: user.id,
      },
    })
    for(var i=0;i<p.length;i++)
    {
      var poid=p[i].id;
      delcomments(poid);
      const deleteposts = await prisma.post.delete({
          where: {
            id: poid,
          },
        });
    }
}
async function delpost(postid)
{
    const deleteposts = await prisma.post.delete({
        where: {
          id: postid,
        },
      });
      delcomments(postid);
   
}
async function delteam(teamid){
    const deleteteam = await prisma.team.delete({
        where: {
          id: teamid,
        },
      })
      delpostteam(teamid);
}
app.get("/profile",async function(req,res){
  if(!user){res.redirect("/");}
  const comauthor=[]
  var teams=await prisma.team.findMany({
    where:{
      makerid:user.id,
    }, });
    const posts=await prisma.post.findMany({
      where: {
        authorId:user.id,
      }, });
      const comment=await prisma.comments.findMany();
      for(var i=0;i<comment.length;i++)
        {
            var caid=comment[i].authorId;
            var author=await prisma.user.findUnique({
                where: {
                  id:caid,
                }, });
                comauthor[i]=author.name;
                
        }
  res.render("profile",{user:user.name,eteams:teams,vcomment:comment,vcomauthor:comauthor,vposts:posts});
});
app.get("/views/signin.ejs",async function(req,res){
  
    res.render("signin",{credentials:""});
});
app.get("/teams",async function(req,res){
  if(!user){res.redirect("/");}
    var teams=await prisma.team.findMany({});
    res.render("teams",{user:user.name,eteams:teams});
})

app.get("/posts",async function(req,res){
  if(!user){res.redirect("/");}
    const posts=await prisma.post.findMany({
        where: {
          teamid:team.id,
        }, });
        const authors=[],comauthor=[];
        const comment=await prisma.comments.findMany();
        for(var i=0;i<posts.length;i++)
        {
            var aid=posts[i].authorId;
            var author=await prisma.user.findUnique({
                where: {
                  id:aid,
                }, });
                authors[i]=author.name;
              }
        for(var i=0;i<comment.length;i++)
        {
            var caid=comment[i].authorId;
            var author=await prisma.user.findUnique({
                where: {
                  id:caid,
                }, });
                comauthor[i]=author.name;
                
        }
      res.render("posts",{user:user.name,vcomment:comment,vcomauthor:comauthor,teamview:team.name,vposts:posts,vauthors:authors});
})
app.post("/update",async function(req,res){
  if(req.body.delete){
    const teams=await prisma.team.findMany({
      where:{
         makerid:user.id
        },
    })
    for(var i=0;i<teams.length;i++){
      var t=teams[i].id;
      delteam(t);
    }
    delpostauth(user.id);
    delcomauth(user.id);
    const deleteuser = await prisma.user.delete({
      where: {
        id: user.id,
      },
    })
    res.redirect("/");
  }
  else{
  var u,e,p;
  if(req.body.username){
   u=req.body.username;
  }
  else
  {
    u=user.name;
  }
  if(req.body.email){
    e=req.body.email;
  }
  else{
    e=user.email;
  }
  if(req.body.password){
    p=req.body.password;
  }
  else{
    p=user.passward;
  }
    const up = await prisma.user.update({
      where: { id: user.id },
      data: { name:u,
      email:e,
    passward:p },
    });
  
  res.redirect("/");
}})
app.post("/create",async function(req,res){
    var team=await prisma.team.create({
        data: {
          name: req.body.teamname,
          makerid:user.id,
        },
      });
      res.redirect("/teams");
});
app.post("/comment",async function(req,res){
    console.log(req.body.delete);
    if(req.body.delete){
        delpost(parseInt(req.body.delete));
        res.redirect("/profile");
    }
    else{  const p=parseInt(req.body.pid);
    var comment=await prisma.comments.create({
        data: {
          content: req.body.comment,
          postid:p,
          authorId:user.id,
        },
      });
        res.redirect("/posts");}
});
app.post("/createpost",async function(req,res){
    post = await prisma.post.create({
        data: {
          title :req.body.title,
          content: req.body.content,
          teamid:team.id,
          authorId:user.id,
        },
      });
      res.redirect("/posts")
})
app.post("/open",async function(req,res){
    
    if(req.body.delete){
        delteam(parseInt(req.body.delete));
        res.redirect("/profile");
    }

    else{
        const tname=req.body.teamview;
     team=await prisma.team.findUnique({
        where: {
          name:tname,
        }, });
        res.redirect("/posts");
}})

app.post("/",async function(req,res){
  user = await prisma.user.findUnique({
  where: {
    email:req.body.email,
  },
    });
    if(user){
        if(user.passward===req.body.password)
        {
        res.redirect("teams");
        }else{
            res.render('login',{credentials:"Wrong Credentials or Not Registered"});
        }}
        else {
            res.render('login',{credentials:"Wrong Credentials or Not Registered"});
        }
    }
);
app.post("/signin",async function(req,res){
    userExists = await prisma.user.findUnique({
        where: {
          email:req.body.email,
        }, });
        if(userExists){
            res.render('signin',{credentials:"Email in Use"}); 
        }
        else{
    user = await prisma.user.create({
        data: {
            passward :req.body.password,
          name: req.body.username,
          email:req.body.email,
        },
      });
      
      res.redirect("/teams");
   }} );
app.listen(process.env.PORT || 3000,function () {console.log("Server working on port 3000");
});
