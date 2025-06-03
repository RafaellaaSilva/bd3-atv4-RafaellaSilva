const express = require("express");
const http = require("http");
const path = require("path");
const ejs = require("ejs");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const dbURL = "mongodb+srv://rafaelladrive1:R6W2OZu8ZoLub3pS@cluster0.jupxc.mongodb.net/"

mongoose.connect(dbURL);
mongoose.connection.on("error", console.error.bind(console, "Erro de conexão:"));
mongoose.connection.once("open", () => {
    console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
});

const Post = mongoose.model("Post", {
    author: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", ejs.renderFile);

app.get("/", (req, res) => {
    res.render("index.html");
});

io.on("connection", async (socket) => {
    console.log("👤 Novo usuário conectado: " + socket.id);

    try {
        const posts = await Post.find({}).sort({ timestamp: -1 }).limit(20).exec();
        socket.emit("previousMessage", posts.reverse());
    } catch (error) {
        console.error("Erro ao buscar posts:", error);
    }

    socket.on("sendMessage", async (data) => {
        if (!data.author || !data.message) {
            return;
        }
        try {
            const post = new Post(data);
            await post.save();

            io.emit("receivedMessage", post);
        } catch (error) {
            console.error("Erro ao salvar post:", error);
        }
    });
});

server.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});
