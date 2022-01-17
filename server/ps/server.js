var http = require('http');
var fs = require('fs');
var url = require('url');
var WebSocket = require ('ws');
var port= '80';
var indir='192.168.1.128';
var utenti=[];
var messaggi=[];
var id_mess=-1;
var prov;
//pagina iniziale
fs.readFile('../index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
 fs.readFile('./iterazioni_websocket.html', function (err, prova) {
         if (err) {  // caso errore
             throw err;
         } 
         else{
         prov=prova;
         }     
//http server per la gestione dei client che entrano
http.createServer(function(req, res) { 
    risorsa=""; 
    var q = url.parse(req.url, true);  //ottenimento dell'url della pagina
    //console.log(q.pathname);
    if((q.pathname)=="/prova.html")
    {
        res.writeHeader(200, {"Content-Type": "text/html"});  //tipo dato http server 
        res.write(prov);  //risposta pagina
        res.end();  //chiusura
    }
    if((q.pathname).split('.')[q.pathname.split('.').length-1]=="js")
    {
        fs.readFile('../'+(q.pathname).split('/'[(q.pathname).split('/').length-1]), function (err, content) {
            if (err) {  // caso errore
                res.writeHead(400, {'Content-type':'text/html'});
               console.log(err);
               res.end("No such script"); 
            } 
            else {
              res.writeHead(200,{'Content-type':'text/javascript'});  //tipo dato http server
              res.end(content);
            }
        });
    }
    if(risorsa=(q.pathname).split('.')[q.pathname.split('.').length-1]=="png"||risorsa=="jpg"||risorsa=="gif"){
        fs.readFile('../image/'+(q.pathname).split('/'[(q.pathname).split('/').length-1]), function (err, content) {
            if (err) {  // caso errore
                res.writeHead(400, {'Content-type':'text/html'});
               console.log(err);
               res.end("No such image"); 
            } 
            else {
              res.writeHead(200,{'Content-type':'image/'+risorsa});  //tipo dato http server
              res.end(content);
            }
        });
    }
    else if(q.pathname=="/"){
    res.writeHeader(200, {"Content-Type": "text/html"});  //tipo dato http server 
    res.write(html);  //risposta pagina
    res.end();  //chiusura
    } 
}).listen(port,indir);
});
});
//web socket per la gestine dei dialoghi
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function connection(ws, req) {
    console.log('Ricevuta richiesta di connessione da ',req.connection.remoteAddress);
    ws.on('message', function incoming(message) {
        var elementi = JSON.parse(message);
      if(elementi.client_login!=null)
      {
        fs.readFile('prova.txt', 'utf8', function (err, data) {
            if (err||data=="") throw err;
            righe=data.split('\n');
            for(i=0;i<righe.length;i++){
            if(righe[i]==elementi.client_login.nome_utente+"|"+elementi.client_login.password)
                {
                    utenti.push(elementi.client_login.nome_utente+"|"+10);
                    console.log(elementi.client_login.nome_utente+"|"+10);
                    login= {
                    "server_risp_login" : 
                     {
                      "nome_utente": elementi.client_login.nome_utente,
                      "password": elementi.client_login.password,
                       "ver_id": elementi.client_login.nome_utente
                        }
                    };

                };   
            }
            ws.send(JSON.stringify(login));
        });
        //  fs.writeFile("prova.txt", data, function(err) {
        //    if(err) return console.log(err);
        //    console.log("The file was saved!");
        //  });
      }
      else if(elementi.client_logout!=null)
      {
          for(nome in utenti)
          {
              if(utenti[nome].split('|')[0]==elementi.client_logout.ver_id && utenti[nome].split('|')[1]==10)
              {
                utenti[nome]=utenti[nome].split('|')[0]+"|1";
                logout={
                    "server_logout":{
                        "ver_id":utenti[nome].split('|')[0]
                    }
                };
                ws.send(JSON.stringify(logout));
              }
          }
      }
      else if(elementi.client_mess!=null)
      {
          id_mess++;
          messaggi[id_mess]=id_mess+"|"+elementi.client_mess.ver_id+"|"+elementi.client_mess.mess;
      }
      //invio più messaggi
      else if(elementi.client_mess_agg!=null)
      {
          var tot={"server_lista_mess":[]};
          console.log("id_mess "+id_mess+"   "+messaggi.length+"   "+elementi.client_mess_agg.id_mess);
        if(id_mess!=0 || messaggi.length-elementi.client_mess_agg.id_mess!=0)
        {
            for(cont=elementi.client_mess_agg.id_mess;cont<messaggi.length-1;cont++)
            {
                //console.log("cont "+messaggi[cont])
                tot.server_lista_mess[cont]={
                        "id": messaggi[cont].split('|')[0],
                        "nome_utente":messaggi[cont].split('|')[1],
                        "mess":messaggi[cont].split('|')[2]
                    };
            };
                console.log(tot);
                ws.send(JSON.stringify(tot));
                var tot={};
        }
      
      }
    });
  });