var http = require('http');
var fs = require('fs');
var url = require('url');
var WebSocket = require ('ws');
var port= '80';
var indir='192.168.1.128';
var id_utenti=0;
var utenti=[];
var messaggi=[];
var id_mess=0;
var prov;
var chat;
//pagina iniziale
fs.readFile('../html/index.html', function (err, html) {
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
 fs.readFile('../html/chat.html', function (err, prova) {
         if (err) {  // caso errore
             throw err;
         } 
         else{
            chat=prova;
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
    if((q.pathname)=="/chat.html")
    {
        res.writeHeader(200, {"Content-Type": "text/html"});  //tipo dato http server 
        res.write(chat);  //risposta pagina
        res.end();  //chiusura
    }
    else if((q.pathname).split('.')[q.pathname.split('.').length-1]=="js")
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
    risorsa=(q.pathname).split('.')[q.pathname.split('.').length-1]
    if(risorsa=="png"||risorsa=="jpg"||risorsa=="gif"){
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
            if (err) throw err;
            righe=data.split('^');
            var ok=false;
            var loggato=false;
            login={};
            for(i=0;i<righe.length;i++){
            if(righe[i]==elementi.client_login.nome_utente+"|"+elementi.client_login.password)
                {
                    for(data in utenti)
                        if(elementi.client_login.nome_utente+"|1"==utenti[data])
                        {utenti[data]=elementi.client_login.nome_utente+"|"+10;
                        ok=true;
                        loga=true;
                        login= {
                            "server_risp_login" : 
                             {
                              "nome_utente": elementi.client_login.nome_utente,
                              "password": elementi.client_login.password,
                               "ver_id": elementi.client_login.nome_utente
                                }
                            };
                            ws.send(JSON.stringify(login));
                        }
                    if(ok==false)
                    {
                        
                        for(data in utenti)
                        if(elementi.client_login.nome_utente+"|10"==utenti[data])
                        loggato=true;
                        
                    
                    if(loggato==false){
                    utenti[id_utenti++]=elementi.client_login.nome_utente+"|"+10;
                    console.log(utenti[id_utenti-1]);
                    
                    login= {
                    "server_risp_login" : 
                     {
                      "nome_utente": elementi.client_login.nome_utente,
                      "password": elementi.client_login.password,
                       "ver_id": elementi.client_login.nome_utente
                        }
                    };
                    ws.send(JSON.stringify(login));
                    }
                    
                    
                    }
                    
                };   

        }
        //console.log("ok"+JSON.stringify(login).toString());
        if(JSON.stringify(login).toString()=="{}"){
            //rifiuto
            erro={
                "errore":"login non valido"
            };
            ws.send(JSON.stringify(erro));
        }
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
            //console.log(elementi.client_logout.ver_id+"    "+elementi.client_logout.ver_id.split('|')[1]);
              if(utenti[nome].split('|')[0]==elementi.client_logout.nome_utente && utenti[nome].split('|')[1]==10)
              {
                utenti[nome]=utenti[nome].split('|')[0]+"|1";
                logout={
                    "server_logout":{
                        "ver_id":utenti[nome].split('|')[0]
                    }
                };
                ws.send(JSON.stringify(logout));
                console.log("uscito");
              }
          }
      }
      else if(elementi.client_mess!=null)
      {
          id_mess++;
          messaggi[id_mess]=id_mess+"|"+elementi.client_mess.ver_id+"|"+elementi.client_mess.mess;
          //console.log(messaggi[id_mess]);
      }
      //invio più messaggi
      else if(elementi.client_mess_agg!=null)
      {
          var tot={"server_lista_mess":[]};
          //id_mess=1;
          //messaggi[0]="0|nicos|ciao";
          //messaggi[1]="0|nicos|cia";
        if(id_mess!=0 || messaggi.length-elementi.client_mess_agg.id_mess!=0)
        {
            //console.log(elementi.client_mess_agg.id_mess+"   "+messaggi[0]);

            for(cont=elementi.client_mess_agg.id_mess;cont<messaggi.length;cont++)
            {
                //console.log(cont);
                try
                {dati =messaggi[cont].split('|');}
                catch(err){
                    console.log(messaggi[cont]);
                }
                tot.server_lista_mess[cont]={
                        "id": dati[0],
                        "nome_utente":dati[1],
                        "mess":dati[2]
                    };

                //console.log(JSON.stringify(tot.server_lista_mess[cont]));
            };
            //console.log(tot);
                ws.send(JSON.stringify(tot));
        }

      }
    });
  });