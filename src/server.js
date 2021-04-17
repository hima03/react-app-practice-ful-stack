import express from 'express'
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb'
// const articlesInfo = {
//     'learn-react' : {
//         upvotes: 0,
//         comments: [],
//     },
//     'learn-node' : {
//         upvotes: 0,
//         comments: [],
//     },
//     'my-thoughts-on-resume':{
//         upvotes: 0,
//         comments: [],
//     },
// }

const app = express();
app.use(bodyParser.json());

const withDB = async (operations, res) => {
    try{
        const client = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser: true})
        const db = client.db('my-blog')
        await operations(db);
        client.close();
    } catch (error) {
        res.status(500).json({message: 'Error connecting to db', error});
    }

}
app.get('/api/articles/:name', async (req, res) => {
    withDB(async(db) =>{
        const articleName = req.params.name;    
        const articlesInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(articlesInfo);
    }, res)
       
    
})
app.post('/api/articles/:name/upvote', async (req,res)=> {
    withDB(async(db) =>{
        const articleName = req.params.name;    
        const articlesInfo = await db.collection('articles').findOne({name: articleName})
         await db.collection('articles').updateOne({name: articleName}, {
             '$set' : {
                 upvotes: articlesInfo.upvotes+1,
             }
         })
         const updatedArticleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(updatedArticleInfo);
    }, res)    
})

app.post('/api/articles/:name/add-comment',  (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;
    withDB(async(db) =>{
        const articlesInfo = await db.collection('articles').findOne({name: articleName})
         await db.collection('articles').updateOne({name: articleName}, {
             '$set' : {
                 comments: articlesInfo.comments.concat({username,text}),
             }
         })
        const updatedArticleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(updatedArticleInfo);
    }, res)    
})
app.listen(8000, ()=> console.log('listening on port 8000'));