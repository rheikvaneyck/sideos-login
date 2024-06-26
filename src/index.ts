require('dotenv').config()
import os from 'os';
import express, { Express, Request, Response, NextFunction } from 'express';
import expressWs from 'express-ws';
import WebSocket from 'ws';
import http from 'http';
import path from 'path';
import { createClient } from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import qr from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { 
  getLoginCreateReqest, 
  getLoginVcToken,
  postLoginConsumeReqest,
  getCredentialOffer,
  postConsumeCredentialOffer,
} from './ssi_auth'
import { setSocket } from './sockets'

const app = express()
const server = http.createServer(app)
expressWs(app, server)
const router = express.Router()
const port = process.env.PORT || 9000;

const redisClient = createClient({ legacyMode: true })
const RedisStore = connectRedis(session)

redisClient.connect().catch(console.error)

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', (err) => console.log('Redis Client connected...'));
redisClient.on('ready', (err) => console.log('Redis Client ready'));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'Session Passphrase',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.route('/login')
  .get(async (req: Request,res: Response) => {
    const request = await getLoginCreateReqest()
    if(request.data.challenge && request.data.jwt) {
      await redisClient.set('chjwt:'+request.data.challenge, request.data.jwt)
      await redisClient.set('chid:'+request.data.challenge, req.session.id)
      console.log('login session:',req.session.id)
      const url =  process.env.CALLBACK_URL + "/gettoken/" + request.data.challenge
      qr.toDataURL(url, (err, qrcode) => {
        if(err) res.send("Error occured")
        res.render("login",{socket_id: req.session.id, qrcode: qrcode, callback_url: process.env.CALLBACK_URL});
      })
    }
  });

app.route('/login/:token?')
  .post(postLoginConsumeReqest);

(app as unknown as expressWs.Application).ws('/login', (ws: WebSocket, req: Request) => {
    ws.on('message', async (msg: string) => {
      console.log(msg);
      if(msg.split(':')[0]== "session") {
        // Link login session with web socket session
        await redisClient.set(msg, req.session.id)
      }
    });
    console.log('socket', req.session.id);
    setSocket(req.session.id, ws)
});

(app as unknown as expressWs.Application).ws('/issue', (ws: WebSocket, req: Request) => {
  ws.on('message', async (msg: string) => {
    console.log(msg);
    if(msg.split(':')[0]== "session") {
      // Link login session with web socket session
      await redisClient.set(msg, req.session.id)
    }
  });
  console.log('socket', req.session.id);
  setSocket(req.session.id, ws)
});

app.route('/gettoken/:token?')
  .get(getLoginVcToken);

app.route('/issue')
.get(async (req: Request,res: Response) => {
  const request = await getCredentialOffer()
  if(request.data.challenge && request.data.jwt) {
    await redisClient.set('chjwt:'+request.data.challenge, request.data.jwt)
    await redisClient.set('chid:'+request.data.challenge, req.session.id)
    const url =  process.env.CALLBACK_URL + "/gettoken/" + request.data.challenge
    qr.toDataURL(url, (err, qrcode) => {
      if(err) res.send("Error occured")
      res.render("issue",{socket_id: req.session.id, qrcode: qrcode, callback_url: process.env.CALLBACK_URL});
    })
  }
});

app.route('/issue/:token?')
  .post(postConsumeCredentialOffer);

app.use(async function(req: Request,res: Response, next: NextFunction) {
  const user_id = await redisClient.v4.get('vc:'+req.session.id, (err: any, data: any) => { console.log('found:',data) })
  console.log('returned:', user_id)
  if(user_id) { return next(); } 
  else { res.redirect('/login') }
});

router.get('/', async function(reg: Request, res: Response, next: NextFunction) {
  res.redirect('/home');
})

router.get('/home', async function(req: Request, res: Response, next: NextFunction) {
  const session_id = req.session.id
  const vc = await redisClient.v4.get('vc:'+session_id)
  res.render("home", {vc: JSON.parse(vc)});
})

router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
  const nr = await redisClient.v4.del('vc:'+req.session.id, (err: Error, n: number) => {
    if(err) { console.log('Trouble deleting vc from redis') }
  })
  await req.session.destroy( (error: Error) => {
    if (error) { console.log('Error destroying the session', error); } 
    else { console.log('session destroyed') }
  })
  res.redirect('/login')
})

app.use('/', router)
server.listen(port, () => {
  console.log('Server started at http://' + os.hostname + ':' + port);
});