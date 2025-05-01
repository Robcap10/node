const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = 3000;

app.use(express.json()); // Middleware для работы с JSON

const filePath = path.join(__dirname, "data.json");

// Функция чтения JSON-файла
function readData() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

// Функция записи в JSON-файл
function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Получение всех пользователей
app.get("/api/users", (req, res) => {
    const data = readData();
    res.json(data.users);
});

// Добавление нового пользователя с автоинкрементным `id`
app.post("/api/users", (req, res) => {
    const newUser = req.body;
    
    if (!newUser.name || !newUser.age) {
        return res.status(400).json({ error: "Имя и возраст обязательны" });
    }

    const data = readData();

    // Найти максимальный ID и увеличить на 1
    const maxId = data.users.length > 0 ? Math.max(...data.users.map(user => user.id)) : 0;
    newUser.id = maxId + 1;

    data.users.push(newUser);
    writeData(data);

    res.status(201).json({ message: "Пользователь добавлен", user: newUser });
});


app.delete("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const data = readData();

    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Удаляем пользователя из массива
    const deletedUser = data.users.splice(userIndex, 1)[0];

    // Записываем обновленные данные обратно в файл
    writeData(data);

    res.json({ message: "Пользователь удален", user: deletedUser });
});

app.put("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const updatedUser = req.body; // Новые данные
    const data = readData();

    // Ищем пользователя
    const userIndex = data.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Обновляем данные пользователя
    data.users[userIndex] = { ...data.users[userIndex], ...updatedUser };

    writeData(data); // Записываем обратно в файл

    res.json({ message: "Пользователь обновлен", user: data.users[userIndex] });
});


app.patch("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id); // Преобразуем id в число
    const updatedFields = req.body; // Получаем переданные поля
    const data = readData();

    // Ищем пользователя
    const user = data.users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Обновляем только переданные поля
    Object.assign(user, updatedFields);

    writeData(data); // Записываем изменения в файл

    res.json({ message: "Пользователь частично обновлен", user });
});



app.listen(PORT, "0.0.0.0",  () => {
    console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
});

