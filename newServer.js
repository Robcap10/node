const express = require("express");
const cors = require("cors");
const fs = require("fs"); // Для работы с файлами
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors())

app.use(express.json()); // Middleware для JSON


function readData() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

// Функция записи в JSON-файл
function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Маршрут для получения данных из JSON-файла
app.get("/api/users", (req, res) => {
  const filePath = path.join(__dirname, "data.json");

//   fs.readFile(filePath, "utf8", (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: "Ошибка чтения файла" });
//     }

//     const jsonData = JSON.parse(data); // Преобразуем строку в объект
//     res.json(jsonData.users);
//   });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});




app.post("/api/users", (req, res) => {
  const newUser = req.body;
  const filePath = path.join(__dirname, "data.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Ошибка чтения файла" });

    const jsonData = JSON.parse(data);
    const maxId = jsonData.users.length > 0 ? Math.max(...jsonData.users.map(user => user.id)) : 1;
    newUser.id = maxId + 1;

    jsonData.users.push(newUser);

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Ошибка записи файла" });
      res.json({ message: "Пользователь добавлен", newUser });
    });
  });
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

