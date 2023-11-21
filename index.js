const mysql = require('mysql2')
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) 
    }
});

const upload = multer({ storage: storage });


const app = express();
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
    

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'cadastro'
});

connection.connect(function(err){
    if (err){
        console.error('erro', err)
        return
    }
console.log("Conexão estabelecida com sucesso")   
 }
)

app.get("/cadastro",function (req, res) {
    res.sendFile(__dirname + "/cadastro.html");
})

app.post('/formulario', upload.single('imagem'), (req, res) =>{
    const nome = req.body.nome;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const bio = req.body.bio;
    const cidade = req.body.cidade;
    const estado= req.body.estado ;
    const imagem_path = req.file.filename;
    const senha = req.body.senha;


    const values = [nome,  nickname, email, bio, cidade, estado,  imagem_path, senha]
    const insert = "insert into usuario(nome, nickname, email, bio, cidade, estado,  imagem_path, senha) values(?,?,?, ?, ?, ?,?, ?)";

    connection.query(insert, values, function(err, result) {
        if (!err) {
        console.log("dados inseridos com sucesso!")
        res.send("dados inseridos");
        }
    else{
        console.log("Não foi possivel inserir os dados", err)
        res.send("erro!");
        }
    })
})

app.listen(8081, function(){
    console.log("servidor rodando na url: http://localhost:8081") 
})


app.get("/listar", function(req, res){
    const selectAll = "select * from usuario";
    

    connection.query(selectAll, function(err, rows){
        if (!err) {
        console.log("dados inseridos com sucesso!")
        res.send(`
        <html>
            <head>
           
            <link rel="stylesheet" type="text/css" href="/style.css">
                <title>Cadastro de jogador</title>
            </head>
            <body>
            <header>
        <div class="container">
            <nav>
                <ul>
                    <img src="https://images.blz-contentstack.com/v3/assets/blt3452e3b114fab0cd/blt03dc217d0e54036a/5dbb29281b83a568128c8c9d/Shadowlands_Logo.png" alt="WoWShadowlands" height="100" width="300">
                    <button class="button" ><a href="http://localhost:8081/cadastro">Cadastro</a></button>
                    <button class="button"><a href="http://localhost:8081/listar">Relatório de players</a></button>
                </ul>
            </nav>
            
        </div>
    </header>
                <h1>Jogadores cadastrados</h1>
                    <table>
                    <tr>
                    <th>ID</th>
                    <th>nome</th>
                   
                    <th>nickname</th>
                    <th>email</th>
                    <th>bio</th>
                    <th>cidade</th>
                    <th>estado</th>
                    <th>imagem</th>
                    </tr>
                    ${rows.map(row =>`
                    <tr>
                        <td>${row.id}</td>
                        <td>${row.nome}</td>                     
                        <td>${row.nickname}</td>
                        <td>${row.email}</td>
                        <td>${row.bio}</td>
                        <td>${row.cidade}</td>
                        <td>${row.estado}</td>    
                        <td> <img src= "/uploads/${row.imagem_path}" alt="imagem" style="width:48px; height:48px";> </td>                        
        <td>
           
                    </tr>
                `).join('')}
                </table>
            </tr>
            </body>
        </html>            
        `);
        }else{
        console.log("erro ao listar os dados!", err)
        res.send("erro!")
        }
    })
    
    })
    
    
app.get("/", function(req, res) {
    res.send(`
        <html>
            <head>
            <link rel="stylesheet" type="text/css" href="/style.css">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Nosifer&display=swap" rel="stylesheet">
                <title>Sistema de gerenciamento de Usuarios</title>
            </head>
            <body>
            <header>
            <div class="container">
                <nav>
                    <ul>
                        <img src="https://images.blz-contentstack.com/v3/assets/blt3452e3b114fab0cd/blt03dc217d0e54036a/5dbb29281b83a568128c8c9d/Shadowlands_Logo.png" alt="WoWShadowlands" height="100" width="300">
                        <button class="button" ><a href="http://localhost:8081/cadastro">Cadastro</a></button>
                        <button class="button"><a href="http://localhost:8081/listar">Relatório de players</a></button>
                    </ul>
                </nav>
                
            </div>
        </header>
            </nav>
            
        </div>
        <body>
        <div class="page">
            <form method="POST" class="formLogin">
                <h1>Login</h1>
                <p>LOGIN.</p>
                <label for="email">E-mail</label>
                <input type="email" placeholder="Digite seu e-mail" autofocus="true" />
                <label for="password">Senha</label>
                <input type="password" placeholder="Digite seu e-mail" />
                <a href="/">Esqueci minha senha</a>
                <input type="submit" value="Acessar" class="btn" />
            </form>
        </div>
        
    </body>
        </html>
        `)
});

app.get("/deletar/:id", function (req, res) {
    const codigoDoJogador = req.params.cod_jogador;

    const deleteJogador = "DELETE FROM perfil WHERE id = ?";

    connection.query(deleteJogador, [codigoDoJogador], function (err, result) {
        if (!err) {
            console.log("Perfil deletado!");
            res.redirect('/formulario');
        } else {
            console.log("Erro ao deletar o perfil: ", err);
        }
    })
});

app.get("/atualizar-form/:id", function (req, res) {
    const codigoDoJogador = req.params.cod_jogador;

    const selectJogador = "SELECT * FROM perfil WHERE id = ?";

    connection.query(selectJogador, [codigoDoJogador], function (err, result) {
        if (!err && result.length > 0) {
            const perfil = result[0];

            res.send(`
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">    
            <title>Editar</title>
                <link rel="stylesheet" type="text/css" href="/estilo.css">
            </head>
            <body class="fundoditar">
                <div class="cabecalhoeditar">
                    <h1><p>
                        <a href="/listar">Perfil</a href>
                        <a href="/"> Home</a href>   
                    </p></h1>
                </div>
                
                <h2><div class="editar">
                <form action="/atualizar/${codigoDoJogador}" method = "POST" enctype="multipart/form-data">
                    <h1>Editar Perfil</h1>
                    <label for="nick">Nick:<br></label>
                    <input type="text" id="nick" name="nick" value="${perfil.nick}" placeholder="Seu nick..." required><br>
                    <br>
                    <label for="usuario">E-Mail:<br></label>
                    <input type="email" id="usuario" name="usuario" value="${perfil.usuario}" placeholder="Seu email..." required><br>
                                     
                    <br>
                    <label for="bio">Deixe aqui sua mensagem ao mundo:<br></label>
                    <textarea name="bio" id="bio" value="${perfil.bio}" placeholder="Mensagem..." required></textarea><br>
                    <br>
                    <label for="cidade">Cidade:<br></label>
                    <input type="text" id="cidade" name="cidade" value="${perfil.cidade}" placeholder="Sua cidade..." required><br>
                    <br>
                    <label for="estado">Estado:<br></label>
                    <input type="text" id="estado" name="estado" value="${perfil.estado}" placeholder="Seu estado..." required><br>
                    <br>
                    <label for="pais">País:<br></label>
                    <input type="text" id="pais" name="pais" value="${perfil.pais}" placeholder="Seu país..." required><br>
                    <br>
                    <label for="imagem_path">Insira sua nova imagem de perfil:</label>
                    <input type="file" id="imagem_path" name="imagem_path" value="${perfil.imagem_path}" accept="image/*"><br>
                    <br>
                    <label for="senha">Senha:<br></label>
                    <input type="password" id="senha" name="senha" value="${perfil.senha}" placeholder="Sua senha..." required><br> 
                    <br>
                    <input type="submit" value="Editar">
                    </form>
                </div></h2>
            </body>
            </html>
            `);
        } else {
            console.log("Erro ao obter dados do perfil: ", err);
        }
    });
});
app.post('/atualizar/:cod_jogador', upload.single('imagem_path'), (req, res) => {
    const nome = req.body.nome;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const bio = req.body.bio;
    const cidade = req.body.cidade;
    const estado= req.body.estado ;
    const imagem_path = req.file.filename;
    const senha = req.body.senha;

    const updateQuery = "UPDATE perfil SET nome=?, nickname=?, bio=?, cidade=?, estado=?, pais=?, imagem_path=? , senha=? WHERE cod_jogador=?";

    connection.query(updateQuery, [usuario, senha, nick, bio, cidade, estado, pais, imagem_path, cod_jogador], function (err, result) {
        if (!err) {
            console.log("Perfil atualizado!");
            res.redirect(`/listar`);
        } else {
            console.log("Erro ao atualizar o perfil: ", err);
        }
    })
});