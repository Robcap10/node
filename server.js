const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { env } = require("process");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware для работы с JSON

const filePath = path.join(__dirname, "data.json");
const booksPath = path.join(__dirname, "books.json");
const postsPath = path.join(__dirname, "posts.json");

// Функция чтения JSON-файла
function readData(path) {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
}

// Функция записи в JSON-файл
function writeData(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

// Получение всех пользователей
app.get("/api/users", (req, res) => {
    const data = readData(filePath);
    res.json(data);
});

app.get("/api/books", (req, res) => {
    const data = readData(booksPath);
    res.json(data);
});
app.get("/api/posts", (req, res) => {
    const data = readData(postsPath);
    res.json(data);
});

app.get("/api/posts/:id", (req, res) => {
    const data = readData(postsPath)
     const postId = parseInt(req.params.id);
    const post = data.find(item => item.id === postId)
    if(!post) {
        res.status(404).json({message: 'Пост не найден'})
        return
    }

    res.json(post)
})

// Добавление нового пользователя с автоинкрементным `id`
app.post("/api/users", (req, res) => {
    const newUser = req.body;
    
    if (!newUser.name || !newUser.age) {
        return res.status(400).json({ error: "Имя и возраст обязательны" });
    }

    const data = readData(filePath);

    // Найти максимальный ID и увеличить на 1
    const maxId = data.users.length > 0 ? Math.max(...data.users.map(user => user.id)) : 0;
    newUser.id = maxId + 1;

    data.users.push(newUser);
    writeData(filePath, data);

    res.status(201).json({ message: "Пользователь добавлен", user: newUser });
});

app.post("/api/posts", (req, res) => {
    const newPost = req.body;

    const data = readData(postsPath);
    // Найти максимальный ID и увеличить на 1
    const maxId = data.length > 0 ? Math.max(...data.map(post => post.id)) : 0;
    newPost.id = maxId + 1;
    newPost.time = new Date().toLocaleDateString() +" "+ new Date().toLocaleTimeString();

    data.unshift(newPost);
    writeData(postsPath, data);

    res.status(201).json({ message: "Post added", post: newPost });
});


app.delete("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const data = readData(filePath);

    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Удаляем пользователя из массива
    const deletedUser = data.users.splice(userIndex, 1)[0];

    // Записываем обновленные данные обратно в файл
    writeData(filePath, data);

    res.json({ message: "Пользователь удален", user: deletedUser });
});

app.delete("/api/posts/:id", (req, res) => {
    const postId = parseInt(req.params.id); // Преобразуем id в число
    const data = readData(postsPath);

    const postIndex = data.findIndex(post => post.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Удаляем пользователя из массива
    const deletedPost = data.splice(postIndex, 1)[0];

    // Записываем обновленные данные обратно в файл
    writeData(postsPath, data);

    res.json({ message: "Post deleted", post: deletedPost });
});

app.put("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const updatedUser = req.body; // Новые данные
    const data = readData(filePath);

    // Ищем пользователя
    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Обновляем данные пользователя
    data.users[userIndex] = { ...data.users[userIndex], ...updatedUser };

    writeData(filePath, data); // Записываем обратно в файл

    res.json({ message: "Пользователь обновлен", user: data.users[userIndex] });
});
app.put("/api/posts/:id", (req, res) => {
    const postId = parseInt(req.params.id); // Преобразуем id в число
    const updatedPost = req.body; // Новые данные
    const data = readData(postsPath);
    console.log(data);

    // Ищем пользователя
    const postIndex = data.findIndex(post => post.id === postId);
    if (postIndex === -1) {
        return res.status(404).json({ error: "Post not found" });
    }

    // Обновляем данные пользователя
    const time = updatedPost.time = new Date().toLocaleDateString() +" "+ new Date().toLocaleTimeString();
    data[postIndex] = { ...data[postIndex], ...updatedPost,  time : time };

    writeData(postsPath, data); // Записываем обратно в файл

    res.json({ message: "Post Updated", post: data[postIndex] });
});


app.patch("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const updatedFields = req.body; // Получаем переданные поля
    const data = readData(filePath);

    // Ищем пользователя
    const user = data.users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Обновляем только переданные поля
    Object.assign(user, updatedFields);

    writeData(filePath, data); // Записываем изменения в файл

    res.json({ message: "Пользователь частично обновлен", user });
});



app.listen(PORT, "0.0.0.0",  () => {
    console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
});

